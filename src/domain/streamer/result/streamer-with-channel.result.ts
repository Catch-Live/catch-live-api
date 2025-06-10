import { Platform } from 'generated/prisma';

export interface StreamerWithChannelResult {
  streamerId: number;
  channel: ChannelResult;
  createdAt: Date;
}
export interface ChannelResult {
  channelId?: string;
  channelName: string;
  platform: Platform;
  videoId?: string;
}
