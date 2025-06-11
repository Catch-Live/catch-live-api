import { Inject, Injectable } from '@nestjs/common';
import { STREAMER_REPOSITORY, StreamerRepository } from './streamer.repository';
import { STREAMING_SERVER_CLIENT, StreamingServerClient } from './client/streaming-server.client';
import { LiveStreamerResult } from './result/live-streamer.result';
import { StartLiveSessionCommand } from './command/streamer.command';

@Injectable()
export class StreamerService {
  constructor(
    @Inject(STREAMER_REPOSITORY)
    private readonly streamerRepository: StreamerRepository,
    @Inject(STREAMING_SERVER_CLIENT)
    private readonly streamingServerClient: StreamingServerClient
  ) {}

  async getLiveStreamers(): Promise<LiveStreamerResult[]> {
    const streamers = await this.streamerRepository.getStreamers();
    const liveStreamers = await this.streamingServerClient.getLiveStreamers(streamers);

    return liveStreamers;
  }

  async startLiveSession(command: StartLiveSessionCommand): Promise<void> {
    await this.streamerRepository.startLiveSession(command);
  }
}
