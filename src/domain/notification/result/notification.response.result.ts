import { NotificationResponseEntity } from '../entity/notification.response.entity';

export class NotificationResponseResult {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;
}

export class NotificationResponseResults {
  readonly nextCursor: number;
  readonly notifications: NotificationResponseResult[];

  constructor(nextCursor: number, notifications: NotificationResponseEntity[]) {
    this.nextCursor = nextCursor;
    this.notifications = notifications;
  }
}
