import { Injectable } from '@nestjs/common';
import { ProfileService } from 'src/domain/profile/profile.service';

@Injectable()
export class ProfileUseCase {
  constructor(private readonly profileService: ProfileService) {}

  async getProfile(userId: number) {
    return this.profileService.getProfile(userId);
  }
}
