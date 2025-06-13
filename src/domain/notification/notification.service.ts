import { Injectable } from '@nestjs/common';
import { NotificationCoreRepository } from 'src/infrastructure/notification/notification.core-repository';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationCoreRepository: NotificationCoreRepository) {}

  async getNotification(query: NotificationsRequestDto) {
    const notifications = await this.notificationCoreRepository.findMany(query);

    let nextCursor = 0;
    if (notifications.length > 0) {
      nextCursor = notifications[notifications.length - 1].notificationId;
    }

    return { nextCursor: nextCursor, notifications: notifications };
  }
}
