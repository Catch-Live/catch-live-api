import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';
import { SignoutRepository } from 'src/domain/signout/signout.repo';
import { SignoutResponseResult } from 'src/domain/signout/result/signout.response.result';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class SignoutCoreRepository implements SignoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateMany(requestDto: UserRequestDto) {
    await this.prisma.$transaction(async (prisma) => {
      const rawData = await prisma.user.updateMany({
        where: {
          user_id: requestDto.userId,
          email: requestDto.email,
          is_deleted: false,
        },
        data: { is_deleted: true, updated_at: new Date() },
      });

      if (rawData.count === 0 || rawData.count > 1) {
        throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
      }
    });

    await this.prisma.token.updateMany({
      where: {
        user_id: requestDto.userId,
      },
      data: { refresh_token: '', updated_at: new Date() },
    });

    return new SignoutResponseResult(true);
  }
}
