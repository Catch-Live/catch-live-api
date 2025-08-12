import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RecordLiveStreamingCommand } from 'src/domain/recording/command/recording.command';
import { RecordingService } from 'src/domain/recording/recording.service';
import { StreamerService } from 'src/domain/streamer/streamer.service';
import { CACHE_SERVICE, CacheService } from 'src/domain/common/cache/cache.service';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { NotificationService } from 'src/domain/notification/notification.service';
import { Transactional } from 'src/infrastructure/prisma/transactional.decorator';
import { REDIS_KEY } from 'src/infrastructure/common/infra.constants';

@Injectable()
export class MonitoringUseCase implements OnModuleInit {
  constructor(
    private readonly streamerService: StreamerService,
    private readonly recordingService: RecordingService,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService
  ) {}

  private readonly IS_CHANGED_KEY = REDIS_KEY.MONITORING_IS_CHANGED;
  private readonly STREAMERS_KEY = REDIS_KEY.MONITORING_STREAMERS;

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
  @Transactional()
  async recordLiveStreams(): Promise<void> {
    try {
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
        // 만약 라이브 방송 녹화 중이면 skip
        if (streamer.isLive) {
          continue;
        }

        // 1. 스트리머 상태 변경
        await this.streamerService.startLiveSession({
          streamerId: streamer.streamerId,
          isLive: true,
        });

        // 2. cached 된 스트리머 목록에서 해당 스트리머 라이브 상태로 변경
        cachedData = cachedData.map((s) =>
          s.streamerId === streamer.streamerId ? { ...s, isLive: true } : s
        );
        await this.cacheService.set(this.STREAMERS_KEY, JSON.stringify(cachedData));

        // 3. 라이브 세션 생성
        const liveSession = await this.recordingService.createLiveSession({
          streamerId: streamer.streamerId,
          platform: streamer.channel.platform,
          channelId: streamer.channel.channelId,
          channelName: streamer.channel.channelName,
          status: 'LIVE',
          title: streamer.title,
        });

        // 4. 녹화 명령 전달
        const command: RecordLiveStreamingCommand = {
          liveSessionId: liveSession.liveSessionId!,
          platform: liveSession.platform,
          channelId: liveSession.channelId,
          channelName: liveSession.channelName,
          streamerId: streamer.streamerId,
          videoId: streamer.videoId,
          title: liveSession.title!,
          subscriptions: [...streamer.subscriptions],
        };
        await this.recordingService.recordLiveStreaming(command);

        // 5. 알림 생성
        const notificationCommand = {
          subscriptions: [...streamer.subscriptions],
          content: `🔴 스트리머 '${streamer.channel.channelName}'님의 라이브 녹화가 시작되었습니다.`,
        };
        await this.notificationService.createNotifications(notificationCommand);
      }
    } catch (err) {
      console.error('[recordLiveStreams] 트랜잭션 실행 중 오류 발생:', err);
      await this.cacheService.set(this.IS_CHANGED_KEY, 'true');
    }
  }
}
