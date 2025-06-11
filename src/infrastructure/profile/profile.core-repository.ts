import { Injectable } from '@nestjs/common';
import { ProfileResponseResult } from 'src/domain/profile/result/profile.response.result';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class ProfileCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(userId: number) {
    const query = {
      where: { is_deleted: false, user_id: userId },
    };

    let rawData: any;
    try {
      rawData = await this.prisma.user.findFirst(query);
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }

    if (!rawData) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }

    const result = new ProfileResponseResult(rawData.created_at, rawData.provider, rawData.email);

    return result;
  }
}
