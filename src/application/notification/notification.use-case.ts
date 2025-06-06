import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/domain/notification/notification.service';
import { NotificationDto } from 'src/interfaces/notification/dto/notification.response.dto';
@Injectable()
export class NotificationUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotification() {
    const entities = await this.notificationService.getNotification();
    const notifications: NotificationDto[] = entities.map((entity) => new NotificationDto(entity));
    return notifications;
  }
}
