import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProfileCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst() {
    const query = {
      where: { is_deleted: false },
    };
    return this.prisma.user.findFirst(query);
  }
}
