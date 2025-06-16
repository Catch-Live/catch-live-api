import { Inject, Injectable } from '@nestjs/common';
import { STREAMER_REPOSITORY, StreamerRepository } from './streamer.repository';
import { STREAMING_SERVER_CLIENT, StreamingServerClient } from './client/streaming-server.client';
import { LiveStreamerResult } from './result/live-streamer.result';
import { LiveSessionCommand } from './command/streamer.command';
import { StreamerWithChannelResult } from './result/streamer-with-channel.result';

@Injectable()
export class StreamerService {
  constructor(
    @Inject(STREAMER_REPOSITORY)
    private readonly streamerRepository: StreamerRepository,
    @Inject(STREAMING_SERVER_CLIENT)
    private readonly streamingServerClient: StreamingServerClient
  ) {}

  async getStreamers(): Promise<LiveStreamerResult[]> {
    return await this.streamerRepository.getStreamers();
  }

  async getLiveStreamers(command: StreamerWithChannelResult[]): Promise<LiveStreamerResult[]> {
    return await this.streamingServerClient.getLiveStreamers(command);
  }

  async startLiveSession(command: LiveSessionCommand): Promise<void> {
    await this.streamerRepository.startLiveSession(command);
  }
}
