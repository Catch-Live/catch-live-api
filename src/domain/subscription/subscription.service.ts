import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, SubscriptionRepository } from './subscription.repository';
import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';
import {
  STREAMING_SERVER_CLIENT,
  StreamingServerClient,
} from '../streamer/client/streaming-server.client';
import { STREAMER_REPOSITORY, StreamerRepository } from '../streamer/streamer.repository';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';
import { CACHE_SERVICE, CacheService } from '../common/cache/cache.service';

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

  async subscribe(userId: number, channelUrl: string): Promise<void> {
    const subscriptions = await this.subscriptionRepository.getSubscriptions(userId);
    const SUBSCRIPTION_LIMIT = Number(process.env.SUBSCRIPTION_LIMIT);

    if (subscriptions.length === SUBSCRIPTION_LIMIT) {
      throw new DomainCustomException(
        HttpStatus.FORBIDDEN,
        DomainErrorCode.SUBSCRIPTION_LIMIT_EXCEEDED
      );
    }

    const channelInfo = await this.streamingServerClient.getChannelInfo(channelUrl);

    const streamer = await this.streamerRepository.findStreamerByChannelId(channelInfo.channelId);

    if (streamer) {
      const subscription = await this.subscriptionRepository.findSubscription(
        userId,
        streamer.streamerId
      );

      if (subscription && subscription.isConnected) {
        throw new DomainCustomException(
          HttpStatus.CONFLICT,
          DomainErrorCode.DUPLICATED_SUBSCRIPTION
        );
      }

      if (subscription && !subscription.isConnected) {
        await this.subscriptionRepository.reconnectSubscription(subscription.subscriptionId);
        await this.cacheService.set(this.IS_CHANGED_KEY, 'true');

        return;
      }

      await this.subscriptionRepository.createSubscription(userId, streamer.streamerId);
      await this.cacheService.set(this.IS_CHANGED_KEY, 'true');

      return;
    }

    await this.subscriptionRepository.createSubscriptionWithStreamer(userId, channelInfo);
    await this.cacheService.set(this.IS_CHANGED_KEY, 'true');
  }
}
