import { Controller, Post, UseGuards, Res, HttpStatus, Req } from '@nestjs/common';
import { LogoutUseCase } from 'src/application/logout/logout.use-case';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { Request, Response } from 'express';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';
import { LogoutResponseDto } from './dto/logout.response.dto';

@UseGuards(JwtAuthGuard)
@Controller('auth')
export class LogoutController {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  @Post('logout')
  async logoutUser(@Req() req: Request, @Res() res: Response) {
    const requestDto = new LogoutRequestDto(req.user as any);
    if (!requestDto.userId) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }
    const entity = await this.logoutUseCase.logoutUser(requestDto);

    if (!entity) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }

    const data = new LogoutResponseDto(String(HttpStatus.OK), 'OK');
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
