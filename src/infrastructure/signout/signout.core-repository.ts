import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SignoutCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateMany() {
    return this.prisma.$transaction(async (prisma) => {
      const result = await prisma.user.updateMany({
        where: { user_id: 2, is_deleted: false }, // Replace with actual user ID or criteria
        data: { is_deleted: true, updated_at: new Date() },
      });

      if (result.count === 0) {
        throw new Error('대상을 찾을 수 없습니다.');
      }
      if (result.count > 2) {
        throw new Error('대상이 너무 많습니다.');
      }

      return true;
    });
  }
}
