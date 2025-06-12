import { StartLiveSessionCommand } from './command/streamer.command';
import { StreamerWithChannelResult } from './result/streamer-with-channel.result';

export const STREAMER_REPOSITORY = Symbol('StreamerRepository');

export interface StreamerRepository {
  getStreamers(): Promise<StreamerWithChannelResult[]>;
  startLiveSession(query: StartLiveSessionCommand): Promise<void>;
  clearVideoInfo(streamerId: number): Promise<void>;
}
