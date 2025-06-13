import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { NotificationRepository } from 'src/domain/notification/notification.repo';
import { NotificationResponseEntity } from 'src/domain/notification/entity/notification.response.entity';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';

@Injectable()
export class NotificationCoreRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: NotificationsRequestDto) {
    let query = {};
    if (!args.cursor) {
      query = {
        take: args.size,
        orderBy: { notification_id: 'desc' },
        where: { user_id: args.userId },
      };
    } else {
      query = {
        take: args.size,
        orderBy: { notification_id: 'desc' },
        where: { user_id: args.userId, notification_id: { lt: args.cursor } },
      };
    }
    const rawData = await this.prisma.notification.findMany(query);
    const result = rawData.map((data) => {
      return new NotificationResponseEntity(data.notification_id, data.content, data.created_at);
    });

    return result;
  }
}
