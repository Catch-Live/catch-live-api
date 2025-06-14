import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/subscription/subscription.repository';
import { SubscriptionCoreRepository } from 'src/infrastructure/subscription/subscription.core-repository';
import { STREAMING_SERVER_CLIENT } from 'src/domain/streamer/client/streaming-server.client';
import { StreamingServerCoreClient } from 'src/infrastructure/streamer/client/streaming-server.core-client';
import { STREAMER_REPOSITORY } from 'src/domain/streamer/streamer.repository';
import { StreamerCoreRepository } from 'src/infrastructure/streamer/streamer.core-repository';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionUseCase,
    SubscriptionService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionCoreRepository,
    },
    {
      provide: STREAMER_REPOSITORY,
      useClass: StreamerCoreRepository,
    },
    {
      provide: STREAMING_SERVER_CLIENT,
      useClass: StreamingServerCoreClient,
    },
  ],
})
export class SubscriptionModule {}
