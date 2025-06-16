import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { NotificationRepository } from 'src/domain/notification/notification.repository';
import { NotificationResponseEntity } from 'src/domain/notification/entity/notification.entity';
import { NotificationRequestCommand } from 'src/domain/notification/command/notification.command';

@Injectable()
export class NotificationCoreRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: NotificationRequestCommand) {
    let query = {};
    if (!args.cursor && args.cursor !== 0) {
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
    const queryData = await this.prisma.notification.findMany(query);
    const result = queryData.map((data) => {
      return new NotificationResponseEntity(data.notification_id, data.content, data.created_at);
    });

    return result;
  }
}
