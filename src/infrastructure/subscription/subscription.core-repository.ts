import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from 'src/domain/subscription/subscription.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { ChannelInfo } from 'src/domain/streamer/streamer.entity';
import { SubscriptionEntity } from 'src/domain/subscription/subscription.entity';

@Injectable()
export class SubscriptionCoreRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSubscription(userId: number, streamerId: number): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        user_id: userId,
        streamer_id: streamerId,
      },
    });

    if (!subscription) {
      return null;
    }

    return new SubscriptionEntity(
      Number(subscription.subscription_id),
      Number(subscription.user_id),
      Number(subscription.streamer_id),
      subscription.is_connected,
      subscription.created_at,
      subscription.updated_at
    );
  }

  async reconnectSubscription(subscriptionId: number): Promise<void> {
    await this.prisma.subscription.update({
      where: {
        subscription_id: subscriptionId,
      },
      data: {
        is_connected: true,
      },
    });
  }

  async createSubscription(userId: number, streamerId: number): Promise<void> {
    await this.prisma.subscription.create({
      data: {
        user_id: userId,
        streamer_id: streamerId,
        is_connected: true,
      },
    });
  }

  async createSubscriptionWithStreamer(userId: number, channelInfo: ChannelInfo): Promise<void> {
    const { channelId, channelName, platform } = channelInfo;

    await this.prisma.$transaction(async (tx) => {
      const streamer = await tx.streamer.create({
        data: {
          channel_id: channelId,
          channel_name: channelName,
          platform,
        },
      });

      await tx.subscription.create({
        data: {
          user_id: userId,
          streamer_id: streamer.streamer_id,
          is_connected: true,
        },
      });
    });
  }

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
