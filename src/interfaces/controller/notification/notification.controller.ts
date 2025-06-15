import { Controller, UseGuards, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';
import { NotificationsResponseDto } from './dto/notification.response.dto';
import { NotificationsRequestDto } from './dto/notification.request.dto';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { NotificationRequestCommand } from 'src/domain/notification/command/notification.command';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) {}

  @Get('')
  async getNotifications(@Req() req: Request, @Res() res: Response) {
    const dto = new NotificationsRequestDto(req);
    const command = new NotificationRequestCommand({ ...dto });
    const result = await this.notificationUseCase.getNotifications(command);

    const data = new NotificationsResponseDto(result);
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
