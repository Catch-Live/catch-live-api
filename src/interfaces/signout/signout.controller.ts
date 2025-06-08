import { Controller, Delete } from '@nestjs/common';
import { SignoutResponseDto } from './dto/signout.response.dto';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';

@Controller('users')
export class SignoutController {
  constructor(private readonly signoutUseCase: SignoutUseCase) {}

  @Delete('me')
  deleteUser() {
    const entity = this.signoutUseCase.signoutUser();
    return new SignoutResponseDto(entity.code, entity.message);
  }
}
