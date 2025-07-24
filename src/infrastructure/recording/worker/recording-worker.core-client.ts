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
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'src/domain/notification/notification.repository';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { REDIS_KEY } from 'src/infrastructure/common/infra.constants';

/**
 *
 * 역할 요약:
 * - 녹화 작업을 Redis 리스트 큐에 전송하고, 워커가 처리 완료된 작업을 모니터링 서버가 주기적으로 감지하여 처리
 * - 워커 장애 감지를 위해 TTL 기반 heartbeat 키 사용
 * - 장애 감지 시, 해당 워커가 소유한 작업을 회수하고 재시도 큐에 등록 (failover)
 * - 모든 상태 추적 및 장애 복구는 Redis 기반으로 동작
 *
 * 주요 기능:
 * - `sendRecordJob`: 녹화 작업 생성 및 대기 큐에 전송
 * - `pollDoneJobOnce`: 완료 큐에서 작업 수신 및 DB 업데이트, 캐시 정리, 알림 전송
 * - `startFailoverDetection`: 워커 생존 여부 감시 및 장애 복구
 * - `confirmFailover`: 장애 워커의 미완료 작업 회수 및 재시도 등록
 *
 * 사용 Redis 키:
 * - JOB_WAITING_QUEUE (List): 일반 작업 대기 큐
 * - JOB_FAIL_QUEUE (List): 장애 복구용 재시도 큐
 * - JOB_DONE_QUEUE_KEY (List): 워커가 처리 완료한 작업이 담기는 큐
 * - JOB_META_KEY (Hash): 녹화 작업 메타데이터 저장 (liveSessionId → RecordPayload)
 * - HEARTBEAT_KEY:<WORKER_ID> (String with TTL): 워커 생존 확인용 키 (5초마다 갱신, TTL 10초)
 * - RECORDING_SET_PREFIX:<WORKER_ID> (Set): 워커가 현재 수행 중인 liveSessionId 목록
 *
 */
@Injectable()
export class RecordingWorkerCoreClient
  implements RecordingWorkerClient, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RecordingWorkerCoreClient.name);
  private readonly JOB_DONE_QUEUE_KEY = REDIS_KEY.JOB_DONE_QUEUE;
  private readonly JOB_META_KEY = REDIS_KEY.JOB_META;
  private readonly JOB_WAITING_QUEUE = REDIS_KEY.JOB_WAITING_QUEUE;
  private readonly JOB_FAIL_QUEUE = REDIS_KEY.JOB_FAIL_QUEUE;
  private readonly HEARTBEAT_KEY = REDIS_KEY.HEARTBEAT;
  private readonly RECORDING_SET_PREFIX = REDIS_KEY.RECORDING_SET_PREFIX;
  private readonly STREAMERS_KEY = REDIS_KEY.MONITORING_STREAMERS;
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
    private readonly streamerRepository: StreamerRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  onModuleInit() {
    this.logger.log('⚙️ RecordingWorkerCoreClient Init 시작');

    try {
      this.startPollingDoneJobs();
      this.logger.log('✅ startPollingDoneJobs started');
      this.startFailoverDetection();
      this.logger.log('✅ startFailoverDetection started');
    } catch (err) {
      this.logger.error('❌ RecordingWorkerCoreClient Init 중 에러:', err);
    }
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
    channelName: string,
    subscriptions: {
      userId: number;
    }[],
    retryCount?: number
  ): Promise<void> {
    const payload: RecordPayload = {
      streamUrl,
      liveSessionId,
      title,
      streamerId,
      retryCount: retryCount ?? 0,
      channelName,
      subscriptions,
    };

    await this.recordingQueueClient.pushJob(this.JOB_WAITING_QUEUE, payload);
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

      const { streamerId, liveSessionId, status, workerId, channelName, subscriptions } = doneJob;
      if (!workerId) return;

      this.logger.log(`작업 완료 큐 수신 - 워커 ${workerId}, 세션 ${liveSessionId}`);

      await this.cacheService.removeFromSet(
        `${this.RECORDING_SET_PREFIX}:${workerId}`,
        String(liveSessionId)
      );
      await this.cacheService.removeHashField(this.JOB_META_KEY, String(liveSessionId));

      if (status === 'COMPLETED') {
        return this.handleCompletedJob(liveSessionId, streamerId, channelName, subscriptions);
      }

      if (status === 'FAILED') {
        return this.handleFailedJob(liveSessionId, streamerId, channelName, subscriptions);
      }

      this.logger.warn(`처리되지 않은 작업 상태: ${status}`);
    } catch (err) {
      this.logger.error(`작업 완료 큐 수신 중 오류`, err);
    }
  }

  private async handleCompletedJob(
    liveSessionId: number,
    streamerId: number,
    channelName: string,
    subscriptions: {
      userId: number;
    }[]
  ) {
    this.logger.log(`녹화 완료 처리 시작 - 세션 ${liveSessionId}`);
    // 녹화 영상 완료
    await this.recordingRepository.completeLiveSession(liveSessionId);
    // 스트리머 라이브 종료
    await this.streamerRepository.endLiveSession({ streamerId, isLive: false });
    // cached 된 스트리머 목록에서 해당 스트리머 라이브 종료 상태로 변경
    await this.changeStreamerAsOffline(streamerId);
    // 라이브가 끝났다는 알림 발송
    await this.notificationRepository.createNotifications({
      subscriptions: subscriptions,
      content: `⚪️ 스트리머 '${channelName}'님의 라이브 녹화가 종료되었습니다.`,
    });
    this.logger.log(`DB 업데이트 완료 - 세션 ${liveSessionId}`);
  }

  private async handleFailedJob(
    liveSessionId: number,
    streamerId: number,
    channelName: string,
    subscriptions: {
      userId: number;
    }[]
  ) {
    this.logger.warn(`녹화 실패 처리됨 - 세션 ${liveSessionId}`);
    // 녹화 영상 실패
    await this.recordingRepository.failLiveSession(liveSessionId);
    // 스트리머 라이브 종료
    await this.streamerRepository.endLiveSession({ streamerId, isLive: false });
    // cached 된 스트리머 목록에서 해당 스트리머 라이브 종료 상태로 변경
    await this.changeStreamerAsOffline(streamerId);
    // 라이브가 끝났다는 알림 발송
    await this.notificationRepository.createNotifications({
      subscriptions: subscriptions,
      content: `⚪️ 스트리머 '${channelName}'님의 라이브 녹화가 종료되었습니다.`,
    });
    this.logger.log(`DB 업데이트 완료 - 세션 ${liveSessionId}`);
  }

  private async changeStreamerAsOffline(streamerId: number) {
    const cached = await this.cacheService.get(this.STREAMERS_KEY);
    let cachedData: StreamerWithChannelResult[] = cached
      ? (JSON.parse(cached) as StreamerWithChannelResult[])
      : [];

    cachedData = cachedData.map((s) => (s.streamerId === streamerId ? { ...s, isLive: false } : s));
    await this.cacheService.set(this.STREAMERS_KEY, JSON.stringify(cachedData));
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
        await this.recordingQueueClient.pushJob(this.JOB_FAIL_QUEUE, job);
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
