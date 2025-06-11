import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { S3 } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as net from 'net';
import { RecordMessage, RecordPayload } from './dto/record-payload.dto';

dotenv.config();
const HOST = 'localhost';
const PORT = 5001;

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
          recordStream(streamUrl, title, 'best').catch((err) => {
            console.error('Error during recording/upload pipeline:', err);
          });
          return;
        }

        console.warn('Unknown message from monitoring-server:', parsed);
      } catch (e) {
        console.error('Failed to parse message from monitoring-server:', e.message);
      }
    });

    socket.on('end', () => {
      console.log('Monitoring server disconnected');
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`Worker TCP server listening on ${HOST}:${PORT}`);
  });
}

async function createRecording(liveSessionId: number) {
  const connection: mysql.Connection = await mysql.createConnection({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  try {
    const [result] = await connection.execute(
      'INSERT INTO recording(live_session_id, status) VALUES (?, ?)',
      [liveSessionId, 'RECORDING']
    );
    console.log(`Created recording:`, result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('DB insert failed:', err.message);
    } else {
      console.error('Unknown DB insert error:', err);
    }
  } finally {
    await connection.end();
  }
}

// AWS S3 설정
const s3 = new S3();

export async function uploadToS3(filePath: string, s3Key: string): Promise<void> {
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
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}

function recordStream(streamUrl: string, title: string = 'recording', quality: string = 'best') {
  return new Promise<void>((resolve, reject) => {
    const outputDir = path.resolve(__dirname, 'recordings');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `${title}-${timestamp}.ts`);

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
            const s3Key = path.basename(outputPath);
            await uploadToS3(outputPath, s3Key);
            fs.unlinkSync(outputPath);
            console.log(`Local file deleted: ${outputPath}`);
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

// 테스트 실행
if (require.main === module) {
  createTcpServer();
}
