import { ChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';

export class SubscriptionWithChannelResult {
  constructor(
    public readonly subscriptionId: number,
    public readonly subscribedAt: Date | null,
    public readonly channel: ChannelResult
  ) {}
}
