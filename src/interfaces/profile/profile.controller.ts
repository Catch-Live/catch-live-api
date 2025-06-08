import { Controller, Get } from '@nestjs/common';
import { ProfileResponseDto } from './dto/profile.response.dto';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';

@Controller('users')
export class ProfileController {
  constructor(private readonly profileUseCase: ProfileUseCase) {}

  @Get('me')
  async getProfile() {
    const entity = await this.profileUseCase.getProfile();
    return new ProfileResponseDto('200', 'OK', entity.createdAt, entity.provider, entity.email);
  }
}
