import { Controller, Get } from '@nestjs/common';
import { NotificationsResponseDto } from './dto/notification.response.dto';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @Get('')
  getNotification() {
    const notifications = this.notificationUseCase.getNotification();
    return new NotificationsResponseDto('200', 'OK', notifications);
  }
}
