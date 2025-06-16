import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { S3 } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

/**
 * recording.process-worker.ts
 *
 * Redis 기반 작업 큐를 소비하며 스트리밍 영상을 녹화하고, 결과를 S3에 업로드한 뒤 DB에 반영하는 워커 프로세스.
 *
 * 주요 기능:
 * - Redis 큐에서 녹화 작업(job)을 가져와 병렬로 처리 (최대 동시 녹화 수 제한)
 * - Streamlink를 통해 `.ts` 포맷 영상 파일로 녹화
 * - 녹화 완료 시 S3에 업로드하고 DB에 결과 반영
 * - 녹화 중단/종료 시 Redis 상태 정리 및 완료 큐에 결과 전송
 * - 워커는 고유 WORKER_ID로 heartbeat TTL을 주기적으로 Redis에 기록
 * - 시작 시 이전 작업의 잔여 상태를 정리하여 failover 대응
 *
 * 사용 Redis 키:
 * - JOB_WAITING_QUEUE / JOB_FAIL_QUEUE (ZSET): 작업 대기 및 실패 큐
 * - JOB_DONE_QUEUE_KEY (LIST): 완료된 작업 큐
 * - JOB_META_KEY (HASH): 작업 메타데이터 저장소
 * - RECORDING_SET_KEY (SET): 현재 워커가 처리 중인 세션 ID 목록
 * - HEARTBEAT_KEY (STRING with TTL): 워커 생존 확인용 키
 *
 * 예외 상황:
 * - 녹화 실패 시 1회 재시도 (retryCount)
 * - 재시도 후에도 실패 시 JOB_DONE_QUEUE_KEY에 'FAILED' 상태로 전송
 */
dotenv.config();

const WORKER_ID = process.env.WORKER_ID ?? randomUUID();
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const JOB_DONE_QUEUE_KEY = process.env.JOB_DONE_QUEUE_KEY!;
const JOB_META_KEY = process.env.JOB_META_KEY!;
const JOB_WAITING_QUEUE = process.env.JOB_WAITING_QUEUE!;
const JOB_FAIL_QUEUE = process.env.JOB_FAIL_QUEUE!;
const HEARTBEAT_KEY = `${process.env.HEARTBEAT_KEY!}:${WORKER_ID}`;
const RECORDING_SET_KEY = `${process.env.RECORDING_SET_PREFIX!}:${WORKER_ID}`;
const MAX_CONCURRENT_RECORDINGS = Number(process.env.MAX_CONCURRENT_RECORDINGS ?? 10);

let currentRunning = 0;
const redis = new Redis(REDIS_PORT, REDIS_HOST);
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
        await redis.zadd(JOB_FAIL_QUEUE, Date.now(), JSON.stringify(job));
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
  const now = Date.now();
  for (const queue of [JOB_FAIL_QUEUE, JOB_WAITING_QUEUE]) {
    const jobs = await redis.zrangebyscore(queue, 0, now, 'LIMIT', 0, 1);
    if (jobs.length > 0) {
      const jobStr = jobs[0];
      const removed = await redis.zrem(queue, jobStr);
      if (removed) {
        return JSON.parse(jobStr) as RecordJob;
      }
    }
  }
  return null;
}

async function handleJob(job: RecordJob) {
  const { liveSessionId, streamUrl, title, streamerId } = job;
  console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 작업 시작`);

  try {
    currentRunning++;
    await redis.hset(JOB_META_KEY, String(liveSessionId), JSON.stringify(job));
    await redis.sadd(RECORDING_SET_KEY, String(liveSessionId));

    const recordingId = await createRecording(liveSessionId);
    await recordStream(liveSessionId, streamUrl, title, recordingId);

    await redis.rpush(
      JOB_DONE_QUEUE_KEY,
      JSON.stringify({ liveSessionId, streamerId, status: 'COMPLETED', workerId: WORKER_ID })
    );
    console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 녹화 완료`);
  } catch (err) {
    console.error(`[${WORKER_ID}] 세션 ${liveSessionId} 녹화 실패`, err);
    const retryCount = (job.retryCount ?? 0) + 1;
    if (retryCount <= 1) {
      job.retryCount = retryCount;
      await redis.zadd(JOB_FAIL_QUEUE, Date.now(), JSON.stringify(job));
    } else {
      await redis.rpush(
        JOB_DONE_QUEUE_KEY,
        JSON.stringify({ liveSessionId, streamerId, status: 'FAILED', workerId: WORKER_ID })
      );
    }
  } finally {
    console.log(`[${WORKER_ID}] 세션 ${liveSessionId} 작업 완료`);
    await redis.srem(RECORDING_SET_KEY, String(liveSessionId));
    currentRunning--;
  }
}

async function createRecording(liveSessionId: number): Promise<number> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'INSERT INTO recording (live_session_id, status) VALUES (?, ?)',
    [liveSessionId, 'RECORDING']
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

  const filename = `${liveSessionId}-${Date.now()}.ts`;
  const outputPath = path.join(dir, filename);

  await runStreamlink(streamUrl, outputPath);
  const url = await uploadToS3(outputPath, title, filename);
  fs.unlinkSync(outputPath);
  await completeRecording(recordingId, url);
}

function runStreamlink(url: string, outputPath: string): Promise<void> {
  console.log(`[${WORKER_ID}] Streamlink 실행 - URL: ${url}, 출력: ${outputPath}`);

  return new Promise((resolve, reject) => {
    const p = spawn('streamlink', [url, 'best', '-o', outputPath]);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
    p.stderr.on('data', (data) => console.error(`[streamlink] ${data}`));
  });
}

async function uploadToS3(filePath: string, title: string, key: string): Promise<string> {
  const bucket = process.env.S3_BUCKET_NAME!;
  const stream = fs.createReadStream(filePath);
  const result = await s3.upload({ Bucket: bucket, Key: key, Body: stream }).promise();
  return result.Location;
}

async function completeRecording(id: number, url: string) {
  await pool.execute(
    'UPDATE recording SET video_url=?, status=?, completed_at=? WHERE recording_id=?',
    [url, 'COMPLETED', new Date(), id]
  );
}
