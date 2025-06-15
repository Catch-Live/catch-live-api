import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RecordLiveStreamingCommand } from 'src/domain/recording/command/recording.command';
import { RecordingService } from 'src/domain/recording/recording.service';
import { StreamerService } from 'src/domain/streamer/streamer.service';
import { TRANSACTION_MANAGER, TransactionManager } from '../common/transaction-manager';
import { CACHE_SERVICE, CacheService } from 'src/domain/common/cache/cache.service';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';

@Injectable()
export class MonitoringUseCase implements OnModuleInit {
  constructor(
    private readonly streamerService: StreamerService,
    private readonly recordingService: RecordingService,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
    @Inject(TRANSACTION_MANAGER) private readonly transactionManager: TransactionManager
  ) {}

  private readonly IS_CHANGED_KEY = process.env.IS_CHANGED_KEY || 'monitoring:isChanged';
  private readonly STREAMERS_KEY = process.env.STREAMERS_KEY || 'monitoring:streamers';

  async onModuleInit() {
    const isChanged = await this.cacheService.get(this.IS_CHANGED_KEY);
    if (isChanged === null) {
      await this.cacheService.set(this.IS_CHANGED_KEY, 'true');
      console.log('[MonitoringInitializer] 최초 isChanged 초기화 완료');
    }
  }

  /**
   * 현재 구독 중인 스트리머들 중 라이브 중인 사람들을 찾아
   * - 세션 시작 처리
   * - 라이브 세션 생성
   * - 녹화 시작
   * - 알림 생성(TODO)
   * 을 차례로 수행하는 유즈케이스
   */
  async recordLiveStreams(): Promise<void> {
    try {
      await this.transactionManager.beginTransaction(async () => {
        const isChanged = await this.cacheService.get(this.IS_CHANGED_KEY);

        if (isChanged === 'true') {
          console.log('[recordLiveStreams] 구독 현황 변경 감지됨');
          await this.cacheService.set(this.IS_CHANGED_KEY, 'false');

          const freshStreamers = await this.streamerService.getStreamers();
          await this.cacheService.set(this.STREAMERS_KEY, JSON.stringify(freshStreamers));
        }

        // 초기 캐시 로딩
        const cached = await this.cacheService.get(this.STREAMERS_KEY);
        let cachedData: StreamerWithChannelResult[] = cached
          ? (JSON.parse(cached) as StreamerWithChannelResult[])
          : [];

        const liveStreamers = await this.streamerService.getLiveStreamers(cachedData);

        if (liveStreamers.length === 0) {
          return;
        }

        for (const streamer of liveStreamers) {
          // 만약 cachedData에 이미 해당 스트리머가 없으면 (중복 방지)
          const isAlreadyRemoved = !cachedData.some((s) => s.streamerId === streamer.streamerId);
          if (isAlreadyRemoved) {
            console.log(`[recordLiveStreams] 이미 처리한 스트리머 ${streamer.streamerId}, 건너뜀`);
            continue;
          }

          // 1. 스트리머 상태 변경
          await this.streamerService.startLiveSession({
            streamerId: streamer.streamerId,
            isLive: true,
          });

          // 2. 라이브 세션 생성
          const liveSession = await this.recordingService.createLiveSession({
            streamerId: streamer.streamerId,
            platform: streamer.channel.platform,
            channelId: streamer.channel.channelId,
            channelName: streamer.channel.channelName,
            status: 'LIVE',
            title: streamer.title,
          });

          // 3. 녹화 명령 전달
          const command: RecordLiveStreamingCommand = {
            liveSessionId: liveSession.liveSessionId!,
            platform: liveSession.platform,
            channelId: liveSession.channelId,
            streamerId: streamer.streamerId,
            videoId: streamer.videoId,
            title: liveSession.title!,
          };
          await this.recordingService.recordLiveStreaming(command);

          // 4. 현재 캐시 상태에서 해당 스트리머 제거
          cachedData = cachedData.filter((s) => s.streamerId !== streamer.streamerId);

          // 5. 캐시 업데이트
          await this.cacheService.set(this.STREAMERS_KEY, JSON.stringify(cachedData));
        }
      });
    } catch (err) {
      console.error('[recordLiveStreams] 트랜잭션 실행 중 오류 발생:', err);
      await this.cacheService.set(this.IS_CHANGED_KEY, 'true');
    }
  }
}
