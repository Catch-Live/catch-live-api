import { Controller, Get } from '@nestjs/common';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { SubscriptionEntity } from 'src/domain/subscription/subscription.entity';

@Controller('/api/v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionUseCase: SubscriptionUseCase) {}

  @Get()
  getSubscriptions(): Promise<SubscriptionEntity[]> {
    return this.subscriptionUseCase.getSubscriptions();
  }
}
