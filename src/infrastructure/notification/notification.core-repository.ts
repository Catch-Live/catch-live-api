import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class NotificationCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.notification.findMany();
  }
}
