import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ProfileRequestDto } from './dto/profile.request.dto';
import { ProfileResponseDto } from './dto/profile.response.dto';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';
import { JwtAuthGuard } from 'src/application/auth/jwt-auth.guard';

@Controller('users')
export class ProfileController {
  constructor(private readonly profileUseCase: ProfileUseCase) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    const requestDto = new ProfileRequestDto(req.user as any);
    const entity = await this.profileUseCase.getProfile(requestDto.userId);
    return new ProfileResponseDto('200', 'OK', entity.createdAt, entity.provider, entity.email);
  }
}
