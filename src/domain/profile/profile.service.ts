import { Injectable } from '@nestjs/common';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';
import { ProfileResponseEntity } from 'src/domain/profile/entity/profile.response.entity';

@Injectable()
export class ProfileService {
  constructor(private readonly profileCoreRepository: ProfileCoreRepository) {}

  async getProfile() {
    const data = await this.profileCoreRepository.findFirst();

    if (data !== null) {
      return new ProfileResponseEntity(data.created_at, data.provider, data.email);
    }
  }
}
