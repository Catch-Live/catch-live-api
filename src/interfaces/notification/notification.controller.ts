import { Controller, Get, Query } from '@nestjs/common';
import { NotificationResponseDto, NotificationsResponseDto } from './dto/notification.response.dto';
import { NotificationsRequestDto } from './dto/notification.request.dto';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @Get('')
  async getNotification(@Query() query: NotificationsRequestDto) {
    const entities = await this.notificationUseCase.getNotification(query);
    const nextCursor = entities.nextCursor;

    const notifications = entities.notifications.map(
      (entity) => new NotificationResponseDto(entity)
    );

    return new NotificationsResponseDto('200', 'OK', nextCursor, notifications);
  }
}
