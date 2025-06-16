import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { StreamerService } from 'src/domain/streamer/streamer.service';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';
import { TransactionManager } from '../common/transaction-manager';

@Injectable()
export class SubscriptionUseCase {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly streamerService: StreamerService,
    private readonly transactionManager: TransactionManager
  ) {}

  private readonly logger = new Logger(SubscriptionUseCase.name);
  private readonly SUBSCRIPTION_LIMIT = Number(process.env.SUBSCRIPTION_LIMIT);

  async getSubscriptions(userId: number): Promise<SubscriptionWithChannelResult[]> {
    return this.subscriptionService.getSubscriptions(userId);
  }

  async subscribe(userId: number, channelUrl: string): Promise<void> {
    const subscriptions = await this.subscriptionService.getSubscriptions(userId);

    if (subscriptions.length === this.SUBSCRIPTION_LIMIT) {
      throw new DomainCustomException(
        HttpStatus.FORBIDDEN,
        DomainErrorCode.SUBSCRIPTION_LIMIT_EXCEEDED
      );
    }

    const channelInfo = await this.streamerService.getChannelInfo(channelUrl);

    const streamer = await this.streamerService.getStreamerByChannelId(channelInfo.channelId);

    if (streamer === null) {
      try {
        await this.transactionManager.beginTransaction(async () => {
          const newStreamer = await this.streamerService.createStreamer(channelInfo);

          await this.subscriptionService.subscribe(userId, newStreamer.streamerId);
        });
      } catch (error) {
        this.logger.error('[subscribe] DB 트랜잭션에서 에러 발생', error);

        throw new DomainCustomException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          DomainErrorCode.DB_SERVER_ERROR
        );
      }

      return;
    }

    await this.subscriptionService.subscribe(userId, streamer.streamerId);
  }
}
