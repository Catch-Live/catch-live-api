import { Inject, Injectable } from '@nestjs/common';
import { RECORDING_REPOSITORY, RecordingRepository } from './recording.repository';
import { GetRecordingsCommand, RecordLiveStreamingCommand } from './command/recording.command';
import { RecordingWithChannelResult } from './result/recording-with-channel.result';
import { CreateLiveSessionCommand } from './command/live-session.command';
import { RECORDING_WORKER_CLIENT, RecordingWorkerClient } from './client/recording-worker.client';
import { API_URL } from 'src/infrastructure/common/infra.constants';

@Injectable()
export class RecordingService {
  constructor(
    @Inject(RECORDING_REPOSITORY)
    private readonly recordingRepository: RecordingRepository,
    @Inject(RECORDING_WORKER_CLIENT)
    private readonly recordingWorkerClient: RecordingWorkerClient
  ) {}

  getRecordings(
    command: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }> {
    const result = this.recordingRepository.getRecordings(command);
    return result;
  }
  createLiveSession(command: CreateLiveSessionCommand) {
    return this.recordingRepository.createLiveSession(command);
  }

  async recordLiveStreaming(command: RecordLiveStreamingCommand) {
    const {
      liveSessionId,
      subscriptions,
      platform,
      channelId,
      channelName,
      videoId,
      title,
      streamerId,
    } = command;
    let streamUrl = '';

    if (platform === 'CHZZK') {
      const CHZZK_LIVE_URL = API_URL.CHZZK.LIVE;
      streamUrl = `${CHZZK_LIVE_URL}/live/${channelId}`;
    }

    if (platform === 'YOUTUBE') {
      const YOUTUBE_LIVE_URL = API_URL.YOUTUBE.LIVE;
      streamUrl = `${YOUTUBE_LIVE_URL}/watch?v=${videoId}`;
    }
    await this.recordingWorkerClient.sendRecordJob(
      streamUrl,
      liveSessionId,
      title,
      streamerId,
      channelName,
      subscriptions
    );
  }
}
