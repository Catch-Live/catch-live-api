export class NotificationResponseResult {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: Date;

  constructor(notificationId: bigint, content: string, createdAt: Date) {
    this.notificationId = Number(notificationId);
    this.content = content;
    this.createdAt = createdAt;
  }
}
