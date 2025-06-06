import { NotificationEntity } from 'src/domain/notification/entity/notification.entity';

export class NotificationDto {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;

  constructor(entity: NotificationEntity) {
    this.notificationId = entity.notificationId;
    this.content = entity.content;
    this.createdAt = entity.createdAt.toISOString();
  }
}

export class NotificationsResponseDto {
  readonly code: string;
  readonly message: string;
  readonly data: { notifications: NotificationDto[] };

  constructor(code: string, message: string, notifications: NotificationDto[]) {
    this.code = code;
    this.message = message;
    this.data = { notifications: notifications };
  }
}
