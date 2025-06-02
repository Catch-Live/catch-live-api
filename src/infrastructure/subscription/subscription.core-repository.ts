import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from 'src/domain/subscription/subscription.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription } from '@prisma/client';
import { SubscriptionEntity } from 'src/domain/subscription/subscription.entity';

@Injectable()
export class SubscriptionCoreRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptions(): Promise<SubscriptionEntity[]> {
    const result: Subscription[] = await this.prisma.subscription.findMany();

    return result.map((subscription) => this.toEntity(subscription));
  }

  private toEntity(subscription: Subscription): SubscriptionEntity {
    return new SubscriptionEntity({
      subscriptionId: Number(subscription.subscription_id),
      userId: Number(subscription.user_id),
      streamerId: Number(subscription.streamer_id),
      isConnected: subscription.is_connected,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    });
  }
}
