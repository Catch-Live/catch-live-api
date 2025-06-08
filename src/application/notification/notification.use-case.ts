import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/domain/notification/notification.service';
import { NotificationsRequestDto } from 'src/interfaces/notification/dto/notification.request.dto';

@Injectable()
export class NotificationUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotification(query: NotificationsRequestDto) {
    const entities = await this.notificationService.getNotification(query);

    return entities;
  }
}
