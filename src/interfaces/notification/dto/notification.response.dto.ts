import { NotificationResponseEntity } from 'src/domain/notification/entity/notification.response.entity';

export class NotificationResponseDto {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;

  constructor(entity: NotificationResponseEntity) {
    this.notificationId = entity.notificationId;
    this.content = entity.content;
    this.createdAt = entity.createdAt.toISOString();
  }
}

export class NotificationsResponseDto {
  readonly code: string;
  readonly message: string;
  readonly data: { nextCursor: number; notifications: NotificationResponseDto[] };

  constructor(
    code: string,
    message: string,
    nextCursor: number,
    notifications: NotificationResponseDto[]
  ) {
    this.code = code;
    this.message = message;
    this.data = { nextCursor: nextCursor, notifications: notifications };
  }
}
