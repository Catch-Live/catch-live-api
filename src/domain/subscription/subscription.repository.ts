import { ChannelInfo } from '../streamer/streamer.entity';
import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';
import { SubscriptionEntity } from './subscription.entity';

export const SUBSCRIPTION_REPOSITORY = Symbol('SubscriptionRepository');

export interface SubscriptionRepository {
  getSubscriptions(userId: number): Promise<SubscriptionWithChannelResult[]>;
  getSubscriptionById(subscriptionId: number): Promise<SubscriptionEntity | null>;
  getSubscription(userId: number, streamerId: number): Promise<SubscriptionEntity | null>;
  updateSubscription(subscription: SubscriptionEntity): Promise<void>;
  createSubscription(userId: number, streamerId: number): Promise<void>;
  createSubscriptionWithStreamer(userId: number, channelInfo: ChannelInfo): Promise<void>;
}
