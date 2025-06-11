import { Controller, Delete, UseGuards, Res, HttpStatus, Req } from '@nestjs/common';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { Request, Response } from 'express';
import { SignoutRequestDto } from 'src/interfaces/controller/signout/dto/signout.request.dto';
import { SignoutResponseDto } from './dto/signout.response.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class SignoutController {
  constructor(private readonly signoutUseCase: SignoutUseCase) {}

  @Delete('me')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    const requestDto = new SignoutRequestDto(req.user as any);
    if (!requestDto.userId) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }
    const entity = await this.signoutUseCase.signoutUser(requestDto);

    if (!entity) {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }

    const data = new SignoutResponseDto(String(HttpStatus.OK), 'OK');
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
