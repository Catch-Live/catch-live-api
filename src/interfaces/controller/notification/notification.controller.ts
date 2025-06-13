import { Controller, UseGuards, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { NotificationResponseDto, NotificationsResponseDto } from './dto/notification.response.dto';
import { NotificationsRequestDto } from './dto/notification.request.dto';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @Get('')
  async getNotification(@Req() req: Request, @Res() res: Response) {
    const { userId } = req.user as { userId: number };
    const query = new NotificationsRequestDto(userId, req.query.size, req.query.cursor);
    const entities = await this.notificationUseCase.getNotification(query);
    const nextCursor = entities.nextCursor;

    const notifications = entities.notifications.map(
      (entity) => new NotificationResponseDto(entity)
    );

    const data = new NotificationsResponseDto(nextCursor, notifications);
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
