import { SubscriptionEntity } from './subscription.entity';

export const SUBSCRIPTION_REPOSITORY = Symbol('SubscriptionRepository');

export interface SubscriptionRepository {
  getSubscriptions(): Promise<SubscriptionEntity[]>;
}
