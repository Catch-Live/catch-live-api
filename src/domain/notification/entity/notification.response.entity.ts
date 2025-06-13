export class NotificationResponseEntity {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;

  constructor(notificationId: bigint, content: string, createdAt: Date) {
    this.notificationId = Number(notificationId);
    this.content = content;
    this.createdAt = createdAt.toISOString();
  }
}
