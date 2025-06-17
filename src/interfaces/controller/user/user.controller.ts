import { Controller, Delete, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserUseCase } from 'src/application/user/user.use-case';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';
import { UserResponseDto } from 'src/interfaces/controller/user/dto/user.response.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from 'src/support/constants';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Delete('me')
  async signoutUser(@Req() req: Request, @Res() res: Response) {
    const requestDto = new UserRequestDto(req);
    await this.userUseCase.signout(requestDto);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/', expires: new Date(0) });
    const data = new UserResponseDto(String(HttpStatus.OK), 'OK');
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
