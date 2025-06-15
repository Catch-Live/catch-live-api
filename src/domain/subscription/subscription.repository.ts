import { ChannelInfo } from '../streamer/streamer.entity';
import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';
import { SubscriptionEntity } from './subscription.entity';

export const SUBSCRIPTION_REPOSITORY = Symbol('SubscriptionRepository');

export interface SubscriptionRepository {
  getSubscriptions(userId: number): Promise<SubscriptionWithChannelResult[]>;
  findSubscription(userId: number, streamerId: number): Promise<SubscriptionEntity | null>;
  reconnectSubscription(subscriptionId: number): Promise<void>;
  createSubscription(userId: number, streamerId: number): Promise<void>;
  createSubscriptionWithStreamer(userId: number, channelInfo: ChannelInfo): Promise<void>;
}
