import { Injectable } from '@nestjs/common';
import { CreateLiveSessionCommand } from 'src/domain/recording/command/live-session.command';
import { RecordLiveStreamingCommand } from 'src/domain/recording/command/recording.command';
import { RecordingService } from 'src/domain/recording/recording.service';
import { StartLiveSessionCommand } from 'src/domain/streamer/command/streamer.command';
import { LiveStreamerResult } from 'src/domain/streamer/result/live-streamer.result';
import { StreamerService } from 'src/domain/streamer/streamer.service';

@Injectable()
export class MonitoringUseCase {
  constructor(
    private readonly streamerService: StreamerService,
    private readonly recordingService: RecordingService
  ) {}

  private isChanged: boolean = true;

  /**
   * 현재 구독 중인 스트리머들 중 라이브 중인 사람들을 찾아
   * - 세션 시작 처리
   * - 라이브 세션 생성
   * - 녹화 시작
   * - 알림 생성(TODO)
   * 을 차례로 수행하는 유즈케이스
   */
  async recordLiveStreams() {
    // 구독 스트리머 목록이 변경되었는지 여부 확인
    let liveStreamers: LiveStreamerResult[] = [];
    if (this.isChanged) {
      console.log('구독 현황 변경!');
      this.isChanged = false;

      // 현재 라이브 중인 스트리머 리스트를 가져옴
      liveStreamers = await this.streamerService.getLiveStreamers();
    }

    // 변경이 없으면 처리하지 않음
    if (liveStreamers.length === 0) {
      return;
    }

    // 각 라이브 스트리머에 대해 녹화 프로세스 실행
    for (const streamer of liveStreamers) {
      const startLiveSessioncommand: StartLiveSessionCommand = {
        streamerId: streamer.streamerId,
        isLive: true,
      };
      // 1. 스트리머 상태 변경 (isLive: false -> true)
      await this.streamerService.startLiveSession(startLiveSessioncommand);

      const createLiveSessionCommand: CreateLiveSessionCommand = {
        streamerId: streamer.streamerId,
        platform: streamer.channel.platform,
        channelId: streamer.channel.channelId,
        channelName: streamer.channel.channelName,
        status: 'LIVE',
        title: streamer.title,
      };
      // 2. 라이브 세션 생성
      const liveSession = await this.recordingService.createLiveSession(createLiveSessionCommand);

      const recordLiveStreamingCommand: RecordLiveStreamingCommand = {
        liveSessionId: liveSession.liveSessionId!,
        platform: liveSession.platform,
        channelId: liveSession.channelId,
        videoId: streamer.videoId,
        title: liveSession.title!,
      };

      // 3. 실제 녹화 명령 전달 (Streamlink 등 외부 프로세스 실행 목적)
      this.recordingService.recordLiveStreaming(recordLiveStreamingCommand);

      // TODO: 4. 녹화 시작 알림 생성
    }
  }

  notifySubscription() {
    this.isChanged = true;
  }
}
