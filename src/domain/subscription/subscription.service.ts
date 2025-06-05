import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, SubscriptionRepository } from './subscription.repository';
import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async getSubscriptions(): Promise<SubscriptionWithChannelResult[]> {
    return await this.subscriptionRepository.getSubscriptions();
  }
}
