import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';

export class GetSubscriptionsResponseDto {
  constructor(private readonly subscriptions: SubscriptionWithChannelResult[]) {}

  static of(subscriptions: SubscriptionWithChannelResult[]): GetSubscriptionsResponseDto {
    return new GetSubscriptionsResponseDto(subscriptions);
  }

  toJSON() {
    return {
      subscriptions: this.subscriptions.map((sub) => ({
        subscriptionId: sub.subscriptionId,
          subscribedAt: sub.subscribedAt,
          channel: sub.channel,
      }))
    }
  }
}
