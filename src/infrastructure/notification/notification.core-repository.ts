import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { NotificationsRequestDto } from 'src/interfaces/notification/dto/notification.request.dto';
import { NOTIFICATION_MAX_SIZE } from 'src/support/constants';

@Injectable()
export class NotificationCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: NotificationsRequestDto) {
    const convertedSize = Number(args.size);
    const convertedcursor = Number(args.cursor);
    const size: number = convertedSize > 0 ? convertedSize : NOTIFICATION_MAX_SIZE;
    let query = {};
    if (!args.cursor) {
      query = {
        take: size,
        orderBy: { notification_id: 'desc' },
      };
    } else {
      query = {
        take: size,
        orderBy: { notification_id: 'desc' },
        where: { notification_id: { lt: convertedcursor } },
      };
    }

    return this.prisma.notification.findMany(query);
  }
}
