import { Injectable, Inject } from '@nestjs/common';
import {
  CreateNotificationsCommand,
  NotificationRequestCommand,
} from 'src/domain/notification/command/notification.command';
import { NotificationResponseResults } from './result/notification.result';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: NotificationRepository
  ) {}
  async getNotifications(query: NotificationRequestCommand) {
    const notifications = await this.notificationRepository.findMany(query);

    let nextCursor = 0;
    if (notifications.length > 0) {
      nextCursor = notifications[notifications.length - 1].notificationId;
    }

    return new NotificationResponseResults(nextCursor, notifications);
  }

  async createNotifications(command: CreateNotificationsCommand): Promise<void> {
    await this.notificationRepository.createNotifications(command);
  }
}
