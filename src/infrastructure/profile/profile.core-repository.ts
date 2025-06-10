import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProfileCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(userId: number) {
    const query = {
      where: { is_deleted: false, user_id: userId },
    };
    return this.prisma.user.findFirst(query);
  }
}
