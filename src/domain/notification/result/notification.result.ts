import { NotificationResponseEntity } from '../entity/notification.entity';

export class NotificationResponseResult {
  readonly notificationId: number;
  readonly content: string;
  readonly createdAt: string;

  constructor(notificationId: number, content: string, createdAt: string) {
    this.notificationId = notificationId;
    this.content = content;
    this.createdAt = createdAt;
  }
}

export class NotificationResponseResults {
  readonly nextCursor: number;
  readonly notifications: NotificationResponseResult[];

  constructor(nextCursor: number, entities: NotificationResponseEntity[]) {
    const result = entities.map(
      (entity) =>
        new NotificationResponseResult(entity.notificationId, entity.content, entity.createdAt)
    );
    this.nextCursor = nextCursor;
    this.notifications = result;
  }
}
