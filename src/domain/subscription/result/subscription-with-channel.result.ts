import { Platform } from '../streamer.entity';

export interface ChannelResult {
  channelId: string;
  channelName: string;
  platform: Platform;
}

export class SubscriptionWithChannelResult {
  constructor(
    public readonly subscriptionId: number,
    public readonly subscribedAt: Date | null,
    public readonly channel: ChannelResult
  ) {}
}
