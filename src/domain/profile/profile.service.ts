import { Injectable } from '@nestjs/common';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';
import { ProfileResponseEntity } from 'src/domain/profile/entity/profile.response.entity';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class ProfileService {
  constructor(private readonly profileCoreRepository: ProfileCoreRepository) {}

  async getProfile(userId: number) {
    if (userId === 0) {
      throw new DomainCustomException(401, DomainErrorCode.UNAUTHORIZED);
    }

    let data;
    try {
      data = await this.profileCoreRepository.findFirst(userId);
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }

    if (data === null) {
      throw new DomainCustomException(401, DomainErrorCode.UNAUTHORIZED);
    }

    return new ProfileResponseEntity(data.created_at, data.provider, data.email);
  }
}
