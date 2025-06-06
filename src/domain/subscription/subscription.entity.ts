export class SubscriptionEntity {
  constructor(
    public readonly subscriptionId: number,
    public readonly userId: number,
    public readonly streamerId: number,
    public readonly isConnected: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
