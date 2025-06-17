import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, SubscriptionRepository } from './subscription.repository';
import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';
import {
  STREAMING_SERVER_CLIENT,
  StreamingServerClient,
} from '../streamer/client/streaming-server.client';
import { STREAMER_REPOSITORY, StreamerRepository } from '../streamer/streamer.repository';
import { CACHE_SERVICE, CacheService } from '../common/cache/cache.service';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STREAMER_REPOSITORY)
    private readonly streamerRepository: StreamerRepository,
    @Inject(STREAMING_SERVER_CLIENT)
    private readonly streamingServerClient: StreamingServerClient,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService
  ) {}

  private readonly IS_CHANGED_KEY = process.env.IS_CHANGED_KEY || 'monitoring:isChanged';

  async getSubscriptions(userId: number): Promise<SubscriptionWithChannelResult[]> {
    return await this.subscriptionRepository.getSubscriptions(userId);
  }

  async getSubscription(userId: number, streamerId: number) {
    return await this.subscriptionRepository.getSubscription(userId, streamerId);
  }

  async createSubscription(userId: number, streamerId: number) {
    return await this.subscriptionRepository.createSubscription(userId, streamerId);
  }

  async subscribe(userId: number, streamerId: number): Promise<void> {
    const subscription = await this.subscriptionRepository.getSubscription(userId, streamerId);

    if (subscription !== null) {
      subscription.connect();

      await this.subscriptionRepository.updateSubscription(subscription);
    } else {
      await this.subscriptionRepository.createSubscription(userId, streamerId);
    }

    await this.cacheService.set(this.IS_CHANGED_KEY, 'true');
  }

  async unsubscribe(subscriptionId: number) {
    const subscription = await this.subscriptionRepository.getSubscriptionById(subscriptionId);

    if (subscription === null) {
      throw new DomainCustomException(HttpStatus.NOT_FOUND, DomainErrorCode.SUBSCRIPTION_NOT_FOUND);
    }

    subscription.disconnect();
    await this.subscriptionRepository.updateSubscription(subscription);
  }
}
