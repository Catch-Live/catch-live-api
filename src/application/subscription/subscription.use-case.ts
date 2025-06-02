import { Injectable } from '@nestjs/common';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';

@Injectable()
export class SubscriptionUseCase {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async getSubscriptions() {
    return this.subscriptionService.getSubscriptions();
  }
}
