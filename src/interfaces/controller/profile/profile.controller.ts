import { Controller, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProfileRequestDto } from './dto/profile.request.dto';
import { ProfileResponseDto } from './dto/profile.response.dto';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Controller('users')
export class ProfileController {
  constructor(private readonly profileUseCase: ProfileUseCase) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const requestDto = new ProfileRequestDto(req.user as any);
    if (!requestDto.userId) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }
    const entity = await this.profileUseCase.getProfile(requestDto.userId);
    const data = new ProfileResponseDto(entity.createdAt, entity.provider, entity.email);
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
