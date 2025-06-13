import { NotificationResponseResult } from 'src/domain/notification/result/notification.response.result';

export class NotificationResponseDto {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;

  constructor(entity: NotificationResponseResult) {
    this.notificationId = entity.notificationId;
    this.content = entity.content;
    this.createdAt = entity.createdAt.toISOString();
  }
}

export class NotificationsResponseDto {
  readonly nextCursor: number;
  readonly notifications: NotificationResponseDto[];

  constructor(nextCursor: number, notifications: NotificationResponseDto[]) {
    this.nextCursor = nextCursor;
    this.notifications = notifications;
  }
}
