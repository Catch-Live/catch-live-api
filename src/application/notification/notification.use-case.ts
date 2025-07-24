import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/domain/notification/notification.service';
import { NotificationRequestCommand } from 'src/domain/notification/command/notification.command';

@Injectable()
export class NotificationUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(query: NotificationRequestCommand) {
    const entities = await this.notificationService.getNotifications(query);

    return entities;
  }
}
