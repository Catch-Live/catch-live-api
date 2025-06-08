import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProfileCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst() {
    return this.prisma.user.findFirst();
  }
}
