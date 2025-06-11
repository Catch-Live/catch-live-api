import { Inject, Injectable } from '@nestjs/common';
import { RECORDING_REPOSITORY, RecordingRepository } from './recording.repository';
import { GetRecordingsCommand, RecordLiveStreamingCommand } from './command/recording.command';
import { RecordingWithChannelResult } from './result/recording-with-channel.result';
import { CreateLiveSessionCommand } from './command/live-session.command';
import { RECORDING_WORKER_CLIENT, RecordingWorkerClient } from './client/recording-worker.client';

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

  recordLiveStreaming(command: RecordLiveStreamingCommand) {
    const { liveSessionId, platform, channelId, videoId, title } = command;
    let streamUrl = '';

    if (platform === 'CHZZK') {
      const chzzkBaseUrl = process.env.CHZZK_LIVE_URL;
      streamUrl = `${chzzkBaseUrl}/live/${channelId}`;
    }

    if (platform === 'YOUTUBE') {
      const youtubeBaseUrl = process.env.YOUTUBE_LIVE_URL;
      streamUrl = `${youtubeBaseUrl}/watch?v=${videoId}`;
    }
    this.recordingWorkerClient.sendRecordJob(streamUrl, liveSessionId, title);
  }
}
