import { LiveSessionCommand } from './command/streamer.command';
import { StreamerWithChannelResult } from './result/streamer-with-channel.result';
import { ChannelInfo, StreamerEntity } from './streamer.entity';

export const STREAMER_REPOSITORY = Symbol('StreamerRepository');

export interface StreamerRepository {
  getStreamers(): Promise<StreamerWithChannelResult[]>;
  startLiveSession(query: LiveSessionCommand): Promise<void>;
  endLiveSession(query: LiveSessionCommand): Promise<void>;
  clearVideoInfo(streamerId: number): Promise<void>;
  getStreamerByChannelId(channelId: string): Promise<StreamerEntity | null>;
  createStreamer(channelInfo: ChannelInfo): Promise<StreamerEntity>;
}
