export type SubscriptionEntityProps = {
  subscriptionId: number;
  userId: number;
  streamerId: number;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class SubscriptionEntity {
  public readonly subscriptionId: number;
  public readonly userId: number;
  public readonly streamerId: number;
  public readonly isConnected: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SubscriptionEntityProps) {
    this.subscriptionId = props.subscriptionId;
    this.userId = props.userId;
    this.streamerId = props.streamerId;
    this.isConnected = props.isConnected;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
