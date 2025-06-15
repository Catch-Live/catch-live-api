import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  RECORDING_REPOSITORY,
  RecordingRepository,
} from 'src/domain/recording/recording.repository';
import { RecordingWorkerClient } from 'src/domain/recording/client/recording-worker.client';
import { RecordPayload } from './dto/record-payload.dto';
import { STREAMER_REPOSITORY, StreamerRepository } from 'src/domain/streamer/streamer.repository';
import {
  RECORDING_QUEUE_CLIENT,
  RecordingQueueClient,
} from 'src/domain/recording/client/recording-queue.client';
import { CACHE_SERVICE, CacheService } from 'src/domain/common/cache/cache.service';

/**
 * RecordingWorkerCoreClient
 *
 * - 녹화 작업을 Redis 큐에 전송하고, 워커에서 처리 완료된 작업을 모니터링 서버가 수신 및 처리함
 * - 완료된 작업은 주기적으로 `JOB_DONE_QUEUE_KEY`에서 pull하여 DB 상태 업데이트 및 캐시 정리 수행
 * - 워커의 heartbeat TTL을 기반으로 워커 장애 감지 및 failover 처리를 수행
 * - 장애가 감지된 워커가 소유한 작업을 회수하여 재시도 큐(`JOB_FAIL_QUEUE`)에 등록
 * - 내부적으로 상태 추적용 Redis SET 및 HASH를 활용하며, 모든 상태 관리와 복구가 Redis 기반으로 동작함
 *
 * 구현 기능:
 * - `sendRecordJob`: 녹화 작업 전송
 * - `pollDoneJobOnce`: 작업 완료 감지 및 처리
 * - `startFailoverDetection`: 워커 장애 감지 및 복구 처리
 * - `confirmFailover`: 장애 워커의 세션 회수 및 재시도 등록
 *
 * 사용 Redis 키:
 * - JOB_DONE_QUEUE_KEY: 완료된 작업 큐
 * - JOB_META_KEY: 작업 메타데이터 (HASH)
 * - JOB_WAITING_QUEUE / JOB_FAIL_QUEUE: ZSET 기반의 작업 대기/재시도 큐
 * - HEARTBEAT_KEY: 워커 생존 확인용 heartbeat 키 (TTL 기반)
 * - RECORDING_SET_PREFIX: 각 워커가 수행 중인 세션 ID 리스트 (SET)
 */
@Injectable()
export class RecordingWorkerCoreClient
  implements RecordingWorkerClient, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RecordingWorkerCoreClient.name);
  private readonly JOB_DONE_QUEUE_KEY = process.env.JOB_DONE_QUEUE_KEY!;
  private readonly JOB_META_KEY = process.env.JOB_META_KEY!;
  private readonly JOB_WAITING_QUEUE = process.env.JOB_WAITING_QUEUE!;
  private readonly JOB_FAIL_QUEUE = process.env.JOB_FAIL_QUEUE!;
  private readonly HEARTBEAT_KEY = process.env.HEARTBEAT_KEY!;
  private readonly RECORDING_SET_PREFIX = process.env.RECORDING_SET_PREFIX!;
  private doneJobPollInterval: NodeJS.Timeout | null = null;
  private failoverCheckInterval: NodeJS.Timeout | null = null;
  private readonly failedWorkerSet = new Set<string>();

  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
    @Inject(RECORDING_QUEUE_CLIENT)
    private readonly recordingQueueClient: RecordingQueueClient,
    @Inject(RECORDING_REPOSITORY)
    private readonly recordingRepository: RecordingRepository,
    @Inject(STREAMER_REPOSITORY)
    private readonly streamerRepository: StreamerRepository
  ) {}

  onModuleInit() {
    this.startPollingDoneJobs();
    this.startFailoverDetection();
  }

  onModuleDestroy() {
    this.stopPollingDoneJobs();
    this.stopFailoverDetection();
  }

  async sendRecordJob(
    streamUrl: string,
    liveSessionId: number,
    title: string,
    streamerId: number,
    retryCount = 0
  ): Promise<void> {
    const payload: RecordPayload = {
      streamUrl,
      liveSessionId,
      title,
      streamerId,
      retryCount,
    };

    const score = Date.now();
    await this.cacheService.zadd(this.JOB_WAITING_QUEUE, score, JSON.stringify(payload));
    this.logger.log(`녹화 작업 전송 완료 - 세션 ${liveSessionId}`);
  }

  private startPollingDoneJobs() {
    this.doneJobPollInterval = setInterval(() => {
      void this.pollDoneJobOnce();
    }, 1000);
  }

  private async pollDoneJobOnce(): Promise<void> {
    try {
      const doneJob = (await this.recordingQueueClient.popJob(
        this.JOB_DONE_QUEUE_KEY
      )) as RecordPayload;
      if (!doneJob) return;

      const { streamerId, liveSessionId, status, workerId } = doneJob;
      if (!workerId) return;

      this.logger.log(`작업 완료 큐 수신 - 워커 ${workerId}, 세션 ${liveSessionId}`);

      await this.cacheService.removeFromSet(
        `${this.RECORDING_SET_PREFIX}:${workerId}`,
        String(liveSessionId)
      );
      await this.cacheService.removeHashField(this.JOB_META_KEY, String(liveSessionId));

      if (status === 'COMPLETED') {
        return this.handleCompletedJob(liveSessionId, streamerId);
      }

      if (status === 'FAILED') {
        return this.handleFailedJob(liveSessionId, streamerId);
      }

      this.logger.warn(`처리되지 않은 작업 상태: ${status}`);
    } catch (err) {
      this.logger.error(`작업 완료 큐 수신 중 오류`, err);
    }
  }

  private async handleCompletedJob(liveSessionId: number, streamerId: number) {
    this.logger.log(`녹화 완료 처리 시작 - 세션 ${liveSessionId}`);
    await this.recordingRepository.completeLiveSession(liveSessionId);
    await this.streamerRepository.endLiveSession({ streamerId, isLive: false });
    this.logger.log(`DB 업데이트 완료 - 세션 ${liveSessionId}`);
  }

  private async handleFailedJob(liveSessionId: number, streamerId: number) {
    this.logger.warn(`녹화 실패 처리됨 - 세션 ${liveSessionId}`);
    await this.recordingRepository.failLiveSession(liveSessionId);
    await this.streamerRepository.endLiveSession({ streamerId, isLive: false });
    this.logger.log(`DB 업데이트 완료 - 세션 ${liveSessionId}`);
  }

  private startFailoverDetection() {
    this.failoverCheckInterval = setInterval(() => {
      void (async () => {
        try {
          const heartbeatKeys = await this.cacheService.getKeys(`${this.HEARTBEAT_KEY}:*`);
          const activeWorkerIds = new Set<string>();

          for (const key of heartbeatKeys) {
            const ttl = await this.cacheService.getTTL(key);
            if (ttl > 0) {
              const workerId = key.split(':').pop();
              if (workerId) activeWorkerIds.add(workerId);
            }
          }

          const allRecordingKeys = await this.cacheService.getKeys(
            `${this.RECORDING_SET_PREFIX}:*`
          );
          for (const key of allRecordingKeys) {
            const workerId = key.split(':').pop();
            if (!workerId) continue;

            if (activeWorkerIds.has(workerId)) {
              this.failedWorkerSet.delete(workerId);
              continue;
            }

            if (this.failedWorkerSet.has(workerId)) continue;

            this.logger.warn(`${workerId} 응답 없음. 장애 조치 예약 중...`);
            this.failedWorkerSet.add(workerId);

            // 5초 후 재확인
            setTimeout(() => {
              void this.confirmFailover(workerId, key);
            }, 5000);
          }
        } catch (err) {
          this.logger.error(`장애 조치 감지 중 오류 발생`, err);
        }
      })();
    }, 3000);
  }

  private async confirmFailover(workerId: string, key: string) {
    const ttl = await this.cacheService.getTTL(`${this.HEARTBEAT_KEY}:${workerId}`);
    if (ttl > 0) {
      this.logger.log(`${workerId} 살아있음. 장애 조치 취소.`);
      this.failedWorkerSet.delete(workerId);
      return;
    }

    this.logger.warn(`${workerId} 여전히 응답 없음. 장애 조치 확정.`);

    const sessionIds = await this.cacheService.getSetMembers(key);
    for (const sessionId of sessionIds) {
      const isCompleted = await this.cacheService.get(`${this.JOB_DONE_QUEUE_KEY}:${sessionId}`);
      if (isCompleted) continue;

      const jobJson = await this.cacheService.getHashField(this.JOB_META_KEY, sessionId);
      if (!jobJson) continue;

      const job = JSON.parse(jobJson) as RecordPayload;
      if ((job.retryCount ?? 0) < 1) {
        job.retryCount = 1;
        await this.cacheService.zadd(this.JOB_FAIL_QUEUE, Date.now(), JSON.stringify(job));
      }

      await this.cacheService.removeHashField(this.JOB_META_KEY, sessionId);
    }

    await this.cacheService.removeAllFromSet(key);
  }

  private stopPollingDoneJobs() {
    if (this.doneJobPollInterval) clearInterval(this.doneJobPollInterval);
  }

  private stopFailoverDetection() {
    if (this.failoverCheckInterval) clearInterval(this.failoverCheckInterval);
  }
}
