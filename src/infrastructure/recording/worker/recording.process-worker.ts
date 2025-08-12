import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { S3 } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { REDIS_KEY } from 'src/infrastructure/common/infra.constants';

/**
 *
 * Redis 기반 작업 큐에서 녹화 작업을 가져와 스트리밍을 영상 파일로 저장하고,
 * S3 업로드 및 DB 반영까지 수행하는 워커 프로세스
 *
 * 주요 기능:
 * - Redis 큐(JOB_WAITING_QUEUE / JOB_FAIL_QUEUE)에서 작업을 BLPOP 방식으로 polling
 * - 최대 동시 녹화 수 제한(MAX_CONCURRENT_RECORDINGS) 하에서 병렬 녹화 처리
 * - Streamlink로 .ts 파일 녹화 후 ffmpeg로 mp4 포맷으로 변환 (압축)
 * - 완료된 결과를 S3에 업로드하고 DB에 영상 URL 및 완료 상태 반영
 * - 완료되면 JOB_DONE_QUEUE_KEY에 결과 payload 전송 (status: COMPLETED or FAILED)
 * - 작업 시작 시 JOB_META_KEY 및 RECORDING_SET_KEY에 상태 저장
 * - 워커는 HEARTBEAT_KEY에 주기적으로 TTL 갱신 → 장애 감지를 위한 생존 신호
 * - 워커 시작 시 이전 실패한 세션 정리 및 재시도 큐 등록
 *
 * Redis 키 사용:
 * - JOB_WAITING_QUEUE (List): 일반 작업 대기 큐 (RPUSH, BLPOP)
 * - JOB_FAIL_QUEUE (List): 실패한 작업 재시도 큐 (RPUSH, BLPOP, 1회 제한)
 * - JOB_DONE_QUEUE_KEY (List): 작업 완료 후 상태 전송 큐 (RPUSH, poll by monitor)
 * - JOB_META_KEY (Hash): 작업 메타데이터 저장소 (liveSessionId → job JSON)
 * - RECORDING_SET_KEY (Set): 현재 워커가 수행 중인 작업 세션 ID 목록
 * - HEARTBEAT_KEY (String with TTL): 2초마다 'alive' 기록, TTL 3초 → TTL 0 시 장애 감지
 *
 * 장애 및 재시도 처리:
 * - 녹화 중 예외 발생 시 retryCount를 확인하여 0이면 retryCount=1로 증가 후 FAIL_QUEUE로 재등록
 * - retryCount ≥ 1 이면 DONE_QUEUE에 status: 'FAILED'로 전송
 * - 워커 시작 시 이전 상태(RECORDING_SET_KEY)를 정리하여 작업 유실 방지
 *
 * 외부 연동:
 * - AWS S3: 완료된 영상 파일 업로드
 * - MySQL: 녹화 시작 및 완료 시점 기록 (recording 테이블)
 * - Streamlink / FFmpeg: 영상 녹화 및 압축
 *
 * 주의:
 * - 녹화 제한(MAX_CONCURRENT_RECORDINGS)을 초과할 경우 대기
 * - 각 작업은 비동기로 처리되어 워커는 연속적으로 polling 가능
 * - worker ID는 ENV로 지정 (WORKER_ID)
 */
dotenv.config();

const WORKER_ID = process.env.WORKER_ID ?? 'worker1';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const JOB_DONE_QUEUE_KEY = REDIS_KEY.JOB_DONE_QUEUE;
const JOB_META_KEY = REDIS_KEY.JOB_META;
const JOB_WAITING_QUEUE = REDIS_KEY.JOB_WAITING_QUEUE;
const JOB_FAIL_QUEUE = REDIS_KEY.JOB_FAIL_QUEUE;
const HEARTBEAT_KEY = `${REDIS_KEY.HEARTBEAT}:${WORKER_ID}`;
const RECORDING_SET_KEY = `${REDIS_KEY.RECORDING_SET_PREFIX}:${WORKER_ID}`;
const MAX_CONCURRENT_RECORDINGS = Number(process.env.MAX_CONCURRENT_RECORDINGS ?? 5);

let currentRunning = 0;
const redis = new Redis(REDIS_PORT, REDIS_HOST); // 일반 명령용
const redisBlocking = new Redis(REDIS_PORT, REDIS_HOST); // BLPOP 전용
const s3 = new S3();
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
});

type RecordJob = {
  streamUrl: string;
  liveSessionId: number;
  title: string;
  streamerId: number;
  retryCount?: number;
  channelName?: string;
  subscriptions: {
    userId: number;
  }[];
};

async function init() {
  await waitForRedisConnectionWithRetry();
  await waitForDBConnectionWithRetry();
  await cleanupStaleJobsOnStartup();
  startHeartbeat();
  await startJobConsumer();
}

void init().catch((err) => {
  console.error(`[${WORKER_ID}] 초기화 실패`, err);
  process.exit(1);
});

function startHeartbeat() {
  setInterval(() => {
    void (async () => {
      try {
        await redis.set(HEARTBEAT_KEY, 'alive', 'EX', 3);
      } catch (err) {
        console.error(`[${WORKER_ID}] 하트비트 전송 실패`, err);
      }
    })();
  }, 2000);
}

async function waitForRedisConnectionWithRetry(maxAttempts = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await redis.ping();
      console.log(`[${WORKER_ID}] Redis 연결 성공`);
      return;
    } catch (err) {
      console.error(`[${WORKER_ID}] Redis 연결 실패 (${attempt}/${maxAttempts})`, err);
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs));
      else process.exit(1);
    }
  }
}

async function waitForDBConnectionWithRetry(maxAttempts = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.getConnection();
      console.log(`[${WORKER_ID}] DB 연결 성공`);
      return;
    } catch (err) {
      console.error(`[${WORKER_ID}] DB 연결 실패 (${attempt}/${maxAttempts})`, err);
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs));
      else process.exit(1);
    }
  }
}

async function cleanupStaleJobsOnStartup() {
  const sessionIds = await redis.smembers(RECORDING_SET_KEY);

  for (const sessionId of sessionIds) {
    const isDone = await redis.get(`${JOB_DONE_QUEUE_KEY}:${sessionId}`);
    const jobJson = await redis.hget(JOB_META_KEY, sessionId);
    const job = jobJson ? (JSON.parse(jobJson) as RecordJob) : null;

    if (isDone) {
      console.log(`[${WORKER_ID}] 이전 세션 ${sessionId} 정리 (done: true)`);
      await redis.srem(RECORDING_SET_KEY, sessionId);
      await redis.hdel(JOB_META_KEY, sessionId);
      continue;
    }

    if (job) {
      const retryCount = job.retryCount ?? 0;
      if (retryCount === 0) {
        job.retryCount = 1;
        await redis.rpush(JOB_FAIL_QUEUE, JSON.stringify(job));
        console.log(`[${WORKER_ID}] 이전 세션 ${sessionId} → 실패 큐로 이동 (retry 0)`);
      } else {
        console.log(`[${WORKER_ID}] 이전 세션 ${sessionId} → 무시 (retry >= 1)`);
      }

      await redis.srem(RECORDING_SET_KEY, sessionId);
      await redis.hdel(JOB_META_KEY, sessionId);
    } else {
      console.log(`[${WORKER_ID}] 이전 세션 ${sessionId} → job 데이터 없음`);
      await redis.srem(RECORDING_SET_KEY, sessionId);
    }
  }
}

async function startJobConsumer() {
  console.log(`[${WORKER_ID}] 작업 소비 루프 시작`);
  let hasQueueLogged = false;

  while (true) {
    try {
      if (currentRunning >= MAX_CONCURRENT_RECORDINGS) {
        if (!hasQueueLogged) {
          console.log(`[${WORKER_ID}] 녹화 슬롯 가득 참. 대기 중...`);
          hasQueueLogged = true;
        }
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      hasQueueLogged = false;

      const job = await pollJobFromQueues();
      if (job) {
        void handleJob(job);
      }
    } catch (err) {
      console.error(`[${WORKER_ID}] 소비 중 예외 발생`, err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function pollJobFromQueues(): Promise<RecordJob | null> {
  try {
    const result = await redisBlocking.blpop([JOB_FAIL_QUEUE, JOB_WAITING_QUEUE], 5); // 5초 타임아웃
    if (!result) return null;

    const [, jobStr] = result;
    return JSON.parse(jobStr) as RecordJob;
  } catch (err) {
    console.error(`[pollJobFromQueues] 큐 polling 중 오류`, err);
    return null;
  }
}

async function handleJob(job: RecordJob) {
  const { liveSessionId, streamUrl, title, streamerId, channelName, subscriptions } = job;
  console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 작업 시작`);

  try {
    currentRunning++;
    await redis.hset(JOB_META_KEY, String(liveSessionId), JSON.stringify(job));
    await redis.sadd(RECORDING_SET_KEY, String(liveSessionId));

    const recordingId = await createRecording(liveSessionId);
    await recordStream(liveSessionId, streamUrl, title, recordingId);

    await redis.rpush(
      JOB_DONE_QUEUE_KEY,
      JSON.stringify({
        liveSessionId,
        streamerId,
        status: 'COMPLETED',
        workerId: WORKER_ID,
        channelName,
        subscriptions,
      })
    );
    console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 녹화 완료`);
  } catch (err) {
    const isTimeoutError = err instanceof Error && err.message === 'Recording timeout reached';

    if (!isTimeoutError) {
      console.error(`[${WORKER_ID}] 세션 ${liveSessionId} 녹화 실패`, err);
      const retryCount = (job.retryCount ?? 0) + 1;
      if (retryCount <= 1) {
        job.retryCount = retryCount;
        await redis.rpush(JOB_FAIL_QUEUE, JSON.stringify(job));
        return;
      }
    }

    await redis.rpush(
      JOB_DONE_QUEUE_KEY,
      JSON.stringify({
        liveSessionId,
        streamerId,
        status: 'FAILED',
        workerId: WORKER_ID,
        channelName,
        subscriptions,
      })
    );
  } finally {
    console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 작업 완료`);
    await redis.srem(RECORDING_SET_KEY, String(liveSessionId));
    currentRunning--;
  }
}

async function createRecording(liveSessionId: number): Promise<number> {
  const utcDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'INSERT INTO recording (live_session_id, status, started_at) VALUES (?, ?, ?)',
    [liveSessionId, 'RECORDING', utcDate]
  );
  console.log(`[${WORKER_ID}] 녹화 생성 완료 - 세션 ${liveSessionId}, ID ${result.insertId}`);
  return result.insertId;
}

async function recordStream(
  liveSessionId: number,
  streamUrl: string,
  title: string,
  recordingId: number
): Promise<void> {
  const dir = path.resolve(__dirname, 'recordings');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filename = `${WORKER_ID}-${liveSessionId}-${Date.now()}.ts`;
  const outputPath = path.join(dir, filename);

  await runStreamlinkWithTimeout(streamUrl, outputPath);

  const afterFilename = filename.replace('.ts', '.mp4');
  const afterOutputPath = path.join(dir, afterFilename);
  await compressWithFFmpeg(outputPath, afterOutputPath); // .mp4 압축 변환
  fs.unlinkSync(outputPath); // 원본 .ts 제거

  const url = await uploadToS3(afterOutputPath, title, filename);
  fs.unlinkSync(afterOutputPath); // .mp4도 정리
  await completeRecording(recordingId, url);
}

function runStreamlinkWithTimeout(
  url: string,
  outputPath: string,
  timeoutMs: number = 1000 * 60 * 60 * 6 // 예: 6시간
): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn('streamlink', [
      url,
      '720p,best',
      '--retry-open',
      '3',
      '--retry-streams',
      '3',
      '-o',
      outputPath,
    ]);

    const timeout = setTimeout(() => {
      console.warn(`[${WORKER_ID}] 타임아웃 도달. streamlink 강제 종료`);
      p.kill('SIGKILL');
      reject(new Error('Recording timeout reached'));
    }, timeoutMs);

    p.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Exit ${code}`));
      }
    });

    p.stderr.on('data', (data) => console.error(`[streamlink] ${data}`));
  });
}

function compressWithFFmpeg(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', [
      '-i',
      inputPath,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-b:v',
      '1000k',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outputPath,
    ]);

    p.on('close', (code) => {
      if (code === 0) {
        console.log(`포맷 완료! ${outputPath}`);
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    p.stderr.on('data', (data) => console.error(`[ffmpeg] ${data}`));
  });
}

async function uploadToS3(filePath: string, title: string, key: string): Promise<string> {
  const bucket = process.env.S3_BUCKET_NAME!;
  const stream = fs.createReadStream(filePath);
  const result = await s3.upload({ Bucket: bucket, Key: key, Body: stream }).promise();
  return result.Location;
}

async function completeRecording(id: number, url: string) {
  const utcDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await pool.execute(
    'UPDATE recording SET video_url=?, status=?, completed_at=? WHERE recording_id=?',
    [url, 'COMPLETED', utcDate, id]
  );
}
