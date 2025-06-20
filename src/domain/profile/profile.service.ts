import { Injectable, Inject } from '@nestjs/common';
import { ProfileRepository, PROFILE_REPOSITORY } from './profile.repo';

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_REPOSITORY) private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: number) {
    return await this.profileRepository.findFirst(userId);
  }
}
