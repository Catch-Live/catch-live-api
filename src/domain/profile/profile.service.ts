import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';
import { ProfileResponseEntity } from 'src/domain/profile/entity/profile.response.entity';

@Injectable()
export class ProfileService {
  constructor(private readonly profileCoreRepository: ProfileCoreRepository) {}

  async getProfile(userId: number) {
    if (userId === 0) {
      throw new InternalServerErrorException('인증되지 않은 사용자입니다.');
    }

    const data = await this.profileCoreRepository.findFirst(userId);

    if (data === null) {
      throw new InternalServerErrorException('인증되지 않은 사용자입니다.');
    }

    return new ProfileResponseEntity(data.created_at, data.provider, data.email);
  }
}
