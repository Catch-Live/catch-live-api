import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { NotificationRepository } from 'src/domain/notification/notification.repo';
import { NotificationResponseResult } from 'src/domain/notification/result/notification.response.result';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';
import { NOTIFICATION_MAX_SIZE } from 'src/support/constants';

@Injectable()
export class NotificationCoreRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: NotificationsRequestDto) {
    const convertedUserId = args.userId;
    const convertedSize = args.size;
    const convertedcursor = Number(args.cursor);
    const size: number = convertedSize > 0 ? convertedSize : Number(NOTIFICATION_MAX_SIZE);
    let query = {};
    if (!args.cursor) {
      query = {
        take: size,
        orderBy: { notification_id: 'desc' },
        where: { user_id: convertedUserId },
      };
    } else {
      query = {
        take: size,
        orderBy: { notification_id: 'desc' },
        where: { user_id: convertedUserId, notification_id: { lt: convertedcursor } },
      };
    }
    const rawData = await this.prisma.notification.findMany(query);
    const result = rawData.map((data) => {
      return new NotificationResponseResult(data.notification_id, data.content, data.created_at);
    });

    return result;
  }
}
