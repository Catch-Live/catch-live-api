import { Injectable } from '@nestjs/common';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileCoreRepository: ProfileCoreRepository) {}

  async getProfile(userId: number) {
    return await this.profileCoreRepository.findFirst(userId);
  }
}
