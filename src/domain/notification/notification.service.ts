import { Injectable } from '@nestjs/common';
import { NotificationCoreRepository } from 'src/infrastructure/notification/notification.core-repository';
import { NotificationResponseEntity } from 'src/domain/notification/entity/notification.response.entity';
import { NotificationsRequestDto } from 'src/interfaces/notification/dto/notification.request.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationCoreRepository: NotificationCoreRepository) {}

  async getNotification(query: NotificationsRequestDto) {
    const dbRows: any[] = await this.notificationCoreRepository.findMany(query);

    const notifications: NotificationResponseEntity[] = dbRows.map(
      (data) => new NotificationResponseEntity(data.notification_id, data.content, data.created_at)
    );

    let nextCursor = 0;
    if (notifications.length > 0) {
      nextCursor = notifications[notifications.length - 1].notificationId;
    }

    return { nextCursor: nextCursor, notifications: notifications };
  }
}
