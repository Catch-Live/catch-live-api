import { Injectable } from '@nestjs/common';
import { NotificationCoreRepository } from 'src/infrastructure/notification/notification.core-repository';
import { NotificationEntity } from 'src/domain/notification/entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationCoreRepository: NotificationCoreRepository) {}

  async getNotification() {
    const dbRows: any[] = await this.notificationCoreRepository.findAll();
    const notifications: NotificationEntity[] = dbRows.map(
      (data) => new NotificationEntity(data.notification_id, data.content, data.created_at)
    );

    return notifications;
  }
}
