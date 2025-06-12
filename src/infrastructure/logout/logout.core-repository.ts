import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';
import { LogoutRepository } from 'src/domain/logout/logout.repo';
import { LogoutResponseResult } from 'src/domain/logout/result/logout.response.result';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class LogoutCoreRepository implements LogoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateMany(requestDto: LogoutRequestDto) {
    await this.prisma.$transaction(async (prisma) => {
      const rawData = await prisma.token.updateMany({
        where: {
          user_id: requestDto.userId,
        },
        data: { refresh_token: '', updated_at: new Date() },
      });

      if (rawData.count === 0 || rawData.count > 1) {
        throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
      }
    });

    return new LogoutResponseResult(true);
  }
}
