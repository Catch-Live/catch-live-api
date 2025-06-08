import { Injectable } from '@nestjs/common';
import { ProfileService } from 'src/domain/profile/profile.service';

@Injectable()
export class ProfileUseCase {
  constructor(private readonly ProfileService: ProfileService) {}

  async getProfile() {
    return await this.ProfileService.getProfile();
  }
}
