import { Platform } from '@prisma/client';

export interface StreamerWithChannelResult {
  streamerId: number;
  channel: ChannelResult;
  createdAt: Date;
  subscriptions: {
    userId: number;
  }[];
}
export interface ChannelResult {
  channelId?: string;
  channelName: string;
  platform: Platform;
  videoId?: string;
}
