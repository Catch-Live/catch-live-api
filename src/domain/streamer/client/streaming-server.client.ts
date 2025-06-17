import { LiveStreamerResult } from '../result/live-streamer.result';
import { StreamerWithChannelResult } from '../result/streamer-with-channel.result';
import { ChannelInfo } from '../streamer.entity';

export const STREAMING_SERVER_CLIENT = Symbol('StreamingServerClient');

export interface StreamingServerClient {
  getLiveStreamers(streamers: StreamerWithChannelResult[]): Promise<LiveStreamerResult[]>;
  getChannelInfo(channelUrl: string): Promise<ChannelInfo>;
}
