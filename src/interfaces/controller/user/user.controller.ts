import { Controller, Delete, UseGuards, Res, HttpStatus, Req } from '@nestjs/common';
import { UserUseCase } from 'src/application/user/user.use-case';
import { JwtAuthGuard } from 'src/interfaces/controller/common/guards/jwt-auth.guard';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { Request, Response } from 'express';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';
import { UserResponseDto } from './dto/user.response.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Delete('me')
  async signoutUser(@Req() req: Request, @Res() res: Response) {
    const requestDto = new UserRequestDto(req);
    await this.userUseCase.signoutUser(requestDto);
    const data = new UserResponseDto(String(HttpStatus.OK), 'OK');
    res.status(HttpStatus.OK).json(ResultResponseDto.success(data));
  }
}
