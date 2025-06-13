import {
  NotificationResponseResult,
  NotificationResponseResults,
} from 'src/domain/notification/result/notification.response.result';

export class NotificationsResponseDto {
  readonly nextCursor: number;
  readonly notifications: NotificationResponseResult[];

  constructor(result: NotificationResponseResults) {
    this.nextCursor = result.nextCursor;
    this.notifications = result.notifications;
  }
}
