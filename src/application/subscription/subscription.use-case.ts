import { Injectable } from '@nestjs/common';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';

@Injectable()
export class SubscriptionUseCase {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async getSubscriptions(): Promise<SubscriptionWithChannelResult[]> {
    return this.subscriptionService.getSubscriptions();
  }
}
