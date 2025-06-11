import { LiveStreamerResult } from '../result/live-streamer.result';
import { StreamerWithChannelResult } from '../result/streamer-with-channel.result';

export const STREAMING_SERVER_CLIENT = Symbol('StreamingServerClient');

export interface StreamingServerClient {
  getLiveStreamers(streamers: StreamerWithChannelResult[]): Promise<LiveStreamerResult[]>;
}
