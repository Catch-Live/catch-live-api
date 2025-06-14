import { Injectable, Inject } from '@nestjs/common';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';
import { NotificationResponseResults } from './result/notification.response.result';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from './notification.repo';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: NotificationRepository
  ) {}
  async getNotification(query: NotificationsRequestDto) {
    const notifications = await this.notificationRepository.findMany(query);

    let nextCursor = 0;
    if (notifications.length > 0) {
      nextCursor = notifications[notifications.length - 1].notificationId;
    }

    return new NotificationResponseResults(nextCursor, notifications);
  }
}
