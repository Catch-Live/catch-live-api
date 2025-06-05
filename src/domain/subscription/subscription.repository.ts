import { SubscriptionWithChannelResult } from './result/subscription-with-channel.result';

export const SUBSCRIPTION_REPOSITORY = Symbol('SubscriptionRepository');

export interface SubscriptionRepository {
  getSubscriptions(): Promise<SubscriptionWithChannelResult[]>;
}
