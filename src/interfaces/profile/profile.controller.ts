import { Controller, Get } from '@nestjs/common';
import { ProfileResponseDto } from './dto/profile.response.dto';

@Controller('users')
export class ProfileController {
  @Get('me')
  getProfile() {
    const data = { provider: 'kakao', email: 'kakao@kakao.com', createdAt: new Date() };
    return new ProfileResponseDto('200', 'OK', data.provider, data.email, data.createdAt);
  }
}
