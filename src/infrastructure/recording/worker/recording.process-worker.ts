import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { S3 } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as net from 'net';
import { RecordMessage, RecordPayload } from './dto/record-payload.dto';

type RecordingEntry = {
  liveSessionId: number;
  recordingId: number;
};

dotenv.config();
const WORKER_HOST = process.env.WORKER_HOST ?? 'localhost';
const WORKER_PORT = Number(process.env.WORKER_PORT) || 5001;
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
let recordings: RecordingEntry[] = [];
let monitoringSocket: net.Socket | null = null;

function createTcpServer(): void {
  const server = net.createServer((socket) => {
    console.log('Monitoring server connected');
    socket.on('data', (data) => {
      // 메시지 처리
      try {
        const parsed = JSON.parse(data.toString()) as RecordMessage;
        if (parsed.type === 'heartbeat' && parsed.payload === 'ping') {
          console.debug('Heartbeat received: ping');
          const pongMsg = JSON.stringify({ type: 'heartbeat', payload: 'pong' });
          socket.write(pongMsg);
          return;
        }

        if (parsed.type === 'record') {
          const { streamUrl, liveSessionId, title } = parsed.payload as RecordPayload;
          void createRecording(liveSessionId);
          recordStream(liveSessionId, streamUrl, title, 'best').catch((err) => {
            console.error('Error during recording/upload pipeline:', err);
          });
          return;
        }

        console.warn('Unknown message from monitoring-server:', parsed);
      } catch (e) {
        console.error('Failed to parse message from monitoring-server:', e.message);
      }
    });

    monitoringSocket = socket;

    socket.on('end', () => {
      console.log('Monitoring server disconnected');
    });
  });

  server.listen(WORKER_PORT, WORKER_HOST, () => {
    console.log(`Worker TCP server listening on ${WORKER_HOST}:${WORKER_PORT}`);
  });
}

async function createRecording(liveSessionId: number) {
  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      'INSERT INTO recording(live_session_id, status) VALUES (?, ?)',
      [liveSessionId, 'RECORDING']
    );

    const recordingId = result.insertId;
    recordings.push({ liveSessionId, recordingId });
    console.log('Created recording:', { liveSessionId, recordingId });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('DB insert failed:', err.message);
    } else {
      console.error('Unknown DB insert error:', err);
    }
  }
}

async function completeRecording(recordingId: number, presignedUrl: string) {
  try {
    const [result] = await pool.execute(
      'UPDATE recording SET video_url=?, status=?, completed_at=? WHERE recording_id=?',
      [presignedUrl, 'COMPLETED', new Date(), recordingId]
    );
    console.log(`Updated recording:`, result);
    // 상태 업데이트 된 영상 정보 배열에서 제거
    recordings = recordings.filter((e) => e.recordingId !== recordingId);

    console.log(`recordings...`, { recordings });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('DB update failed:', err.message);
    } else {
      console.error('Unknown DB Update error:', err);
    }
  }
}

// AWS S3 설정
const s3 = new S3();

export async function uploadToS3(filePath: string, title: string, s3Key: string): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME is not defined in .env file');
  }

  const fileStream = fs.createReadStream(filePath);
  const params: S3.PutObjectRequest = {
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
  };

  console.log(`Uploading ${filePath} to S3 as ${s3Key}...`);

  try {
    const result = await s3.upload(params).promise();
    console.log('Upload successful:', result.Location);

    // presigned URL 생성
    const encodedTitle = encodeURIComponent(`${title}.ts`);
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 60 * 60 * 24 * 3, // URL 유효시간 (초), 3일 동안
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodedTitle}`,
    });

    console.log('Presigned URL:', signedUrl);

    return signedUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}

function recordStream(
  liveSessionId: number,
  streamUrl: string,
  title: string = 'recording',
  quality: string = 'best'
) {
  return new Promise<void>((resolve, reject) => {
    const outputDir = path.resolve(__dirname, 'recordings');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `${liveSessionId}-${timestamp}.ts`);
    const streamlink = spawn('streamlink', [streamUrl, quality, '-o', outputPath]);

    console.log(`[START] Recording from: ${streamUrl}`);
    console.log(`Saving to: ${outputPath}`);

    streamlink.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    streamlink.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    streamlink.on('close', (code) => {
      void (async () => {
        if (code === 0) {
          console.log(`Recording finished: ${outputPath}`);

          try {
            // S3에 영상 업로드
            const s3Key = path.basename(outputPath);
            const presignedUrl = await uploadToS3(outputPath, title, s3Key);
            // 다운 받았던 영상 제거
            fs.unlinkSync(outputPath);
            // 녹화 상태 완료로 변경
            const filename = path.basename(outputPath);
            const liveSessionId = Number(filename.split('-')[0]);
            const entry = recordings.find((r) => r.liveSessionId === Number(liveSessionId));
            await completeRecording(entry!.recordingId, presignedUrl);
            // 모니터링 서버에 녹화 완료 신호 전송
            if (monitoringSocket && !monitoringSocket.destroyed) {
              const doneMessage = JSON.stringify({
                type: 'record',
                payload: {
                  liveSessionId,
                },
              });
              monitoringSocket.write(doneMessage);
              console.log('Sent recording-complete message to monitoring server');
            }
            resolve();
          } catch (uploadErr) {
            console.error(`S3 upload failed:`, uploadErr);
            reject(uploadErr instanceof Error ? uploadErr : new Error(String(uploadErr)));
          }
        } else {
          const exitCode = code ?? 'null';
          console.error(`streamlink exited with code ${exitCode}`);
          reject(new Error(`streamlink failed with code ${exitCode}`));
        }
      })();
    });
  });
}

// 워커 메인 실행
if (require.main === module) {
  createTcpServer();
}
