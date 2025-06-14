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

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STREAMER_REPOSITORY)
    private readonly streamerRepository: StreamerRepository,
    @Inject(STREAMING_SERVER_CLIENT)
    private readonly streamingServerClient: StreamingServerClient
  ) {}

  async getSubscriptions(): Promise<SubscriptionWithChannelResult[]> {
    return await this.subscriptionRepository.getSubscriptions();
  }

  async subscribe(userId: number, channelUrl: string): Promise<void> {
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
        return;
      }

      await this.subscriptionRepository.createSubscription(userId, streamer.streamerId);
    }

    await this.subscriptionRepository.createSubscriptionWithStreamer(userId, channelInfo);
  }
}
