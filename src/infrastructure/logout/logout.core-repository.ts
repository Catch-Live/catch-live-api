import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';
import { LogoutRepository } from 'src/domain/logout/logout.repo';
import { LogoutResponseResult } from 'src/domain/logout/result/logout.response.result';

@Injectable()
export class LogoutCoreRepository implements LogoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateMany(requestDto: LogoutRequestDto) {
    const rawData = await this.prisma.token.updateMany({
      where: {
        user_id: requestDto.userId,
      },
      data: { refresh_token: '', updated_at: new Date() },
    });

    if (rawData.count === 0 || rawData.count > 2) {
      return new LogoutResponseResult(false);
    }

    return new LogoutResponseResult(true);
  }
}
