import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscription.controller';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/subscription/subscription.repository';
import { SubscriptionCoreRepository } from 'src/infrastructure/subscription/subscription.core-repository';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionUseCase,
    SubscriptionService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionCoreRepository,
    },
  ],
})
export class SubscriptionModule {}
