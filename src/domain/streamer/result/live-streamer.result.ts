import { ChannelResult } from './streamer-with-channel.result';

export interface LiveStreamerResult {
  streamerId: number;
  channel: ChannelResult;
  createdAt?: Date;
  title?: string;
  videoId?: string;
  subscriptions: {
    userId: number;
  }[];
}
