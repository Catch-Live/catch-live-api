import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, SubscriptionRepository } from './subscription.repository';
import { SubscriptionEntity } from './subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async getSubscriptions(): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepository.getSubscriptions();
  }
}
