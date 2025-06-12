import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as net from 'net';
import { RecordingWorkerClient } from 'src/domain/recording/client/recording-worker.client';
import { RecordMessage, RecordPayload } from './dto/record-payload.dto';
import {
  RECORDING_REPOSITORY,
  RecordingRepository,
} from 'src/domain/recording/recording.repository';

/**
 * 녹화 워커와 TCP 소켓으로 통신하는 클라이언트입니다.
 *
 * - 녹화 작업 요청 전송(sendRecordJob)
 * - 5초 간격 하트비트로 연결 상태 확인(startHeartbeat)
 * - 연결 끊김 시 최대 10회 재접속 시도 (재시도 간격 5초, reconnect)
 */
@Injectable()
export class RecordingWorkerCoreClient implements RecordingWorkerClient, OnModuleInit {
  constructor(
    @Inject(RECORDING_REPOSITORY) private readonly recordingRepository: RecordingRepository
  ) {}
  onModuleInit() {
    this.run();
  }

  private readonly logger = new Logger(RecordingWorkerCoreClient.name);
  private socket: net.Socket | null = null;
  private readonly HOST = 'localhost'; // 또는 docker-compose 서비스 이름 (예: 'worker')
  private readonly PORT = process.env.WORKER_PORT ?? 5001;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private retryCount = 0;
  private readonly maxRetries = 10;

  run(): void {
    this.logger.log(`Connecting to process-worker at ${this.HOST}:${this.PORT}...`);

    this.connectToProcessWorker();
  }

  sendRecordJob(streamUrl: string, liveSessionId: number, title: string): void {
    if (!this.socket || this.socket.destroyed) {
      this.logger.error('No active connection to worker. Cannot send record job.');
      return;
    }

    const payload: RecordPayload = {
      streamUrl,
      liveSessionId,
      title,
    };
    const recordMsg = JSON.stringify({ type: 'record', payload });
    this.socket.write(recordMsg);

    this.logger.log(`Sent record job to process-worker for session ${payload.liveSessionId}`);
  }

  private connectToProcessWorker(): void {
    this.socket = net.createConnection({ host: this.HOST, port: Number(this.PORT) }, () => {
      this.logger.log('Connected to process-worker');

      this.startHeartbeat();
    });

    this.socket.on('data', (data) => {
      void (async () => {
        const msg = data.toString();
        try {
          const parsed = JSON.parse(msg) as RecordMessage;

          if (parsed.type === 'heartbeat' && parsed.payload === 'pong') {
            this.logger.debug('Heartbeat received: pong');
            return;
          }

          if (parsed.type === 'record') {
            this.logger.log(`received completed Recording MSG!`);

            const { liveSessionId } = parsed.payload as RecordPayload;
            await this.recordingRepository.completeLiveSession(liveSessionId);
            return;
          }

          this.logger.warn('Unknown message from worker:', parsed);
        } catch (e) {
          this.logger.error('Failed to parse message from worker:', (e as Error).message);
        }
      })();
    });

    this.socket.on('error', (err) => {
      this.logger.error('Socket error:', err.message);
      this.reconnect();
    });

    this.socket.on('close', () => {
      this.logger.warn('Socket closed');
      this.reconnect();
    });

    this.socket.on('end', () => {
      this.logger.warn('Disconnected from process-worker');
      this.socket = null;
    });
  }

  private reconnect() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    if (this.retryCount >= this.maxRetries) {
      this.logger.error(`Max retries (${this.maxRetries}) reached. Stopping reconnect attempts.`);
      this.isReconnecting = false;
      return;
    }

    this.retryCount++;
    this.logger.log(`Reconnecting in 5s... (Attempt ${this.retryCount}/${this.maxRetries})`);

    this.stopHeartbeat();

    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }

    setTimeout(() => {
      this.connectToProcessWorker();
      this.isReconnecting = false;
    }, 5000);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (!this.socket || this.socket.destroyed) {
        this.logger.warn('Socket not connected. Skipping heartbeat.');
        return;
      }

      const pingMsg = JSON.stringify({ type: 'heartbeat', payload: 'ping' });
      this.socket.write(pingMsg);
    }, 5000); // 5초마다 하트비트
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
