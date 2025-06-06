import { Controller, Get } from '@nestjs/common';
import { NotificationDto, NotificationsResponseDto } from './dto/notification.response.dto';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @Get('')
  async getNotification() {
    const notifications: NotificationDto[] = await this.notificationUseCase.getNotification();
    return new NotificationsResponseDto('200', 'OK', notifications);
  }
}
