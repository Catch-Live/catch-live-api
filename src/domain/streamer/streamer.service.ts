import { Inject, Injectable } from '@nestjs/common';
import { STREAMER_REPOSITORY, StreamerRepository } from './streamer.repository';
import { STREAMING_SERVER_CLIENT, StreamingServerClient } from './client/streaming-server.client';
import { LiveStreamerResult } from './result/live-streamer.result';
import { LiveSessionCommand } from './command/streamer.command';
import { StreamerWithChannelResult } from './result/streamer-with-channel.result';
import { ChannelInfo, StreamerEntity } from './streamer.entity';

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

  async getChannelInfo(channelUrl: string) {
    return await this.streamingServerClient.getChannelInfo(channelUrl);
  }

  async getStreamerByChannelId(channelId: string) {
    return await this.streamerRepository.getStreamerByChannelId(channelId);
  }

  async createStreamer(channelInfo: ChannelInfo): Promise<StreamerEntity> {
    return await this.streamerRepository.createStreamer(channelInfo);
  }
}
