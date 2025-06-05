import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from 'src/domain/subscription/subscription.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';

@Injectable()
export class SubscriptionCoreRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptions(): Promise<SubscriptionWithChannelResult[]> {
    const result = await this.prisma.subscription.findMany({
      select: {
        subscription_id: true,
        created_at: true,
        streamer: {
          select: {
            channel_id: true,
            channel_name: true,
            platform: true,
          },
        },
      },
    });

    return result.map((subscription) => ({
      subscriptionId: Number(subscription.subscription_id),
      subscribedAt: subscription.created_at,
      channel: {
        channelId: subscription.streamer.channel_id,
        channelName: subscription.streamer.channel_name,
        platform: subscription.streamer.platform,
      },
    }));
  }
}
