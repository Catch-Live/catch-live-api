import { Injectable } from '@nestjs/common';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';

@Injectable()
export class SubscriptionUseCase {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async getSubscriptions(userId: number): Promise<SubscriptionWithChannelResult[]> {
    return this.subscriptionService.getSubscriptions(userId);
  }

  async subscribe(userId: number, channelUrl: string): Promise<void> {
    await this.subscriptionService.subscribe(userId, channelUrl);
  }
}
