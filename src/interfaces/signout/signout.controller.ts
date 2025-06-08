import { Controller, Delete } from '@nestjs/common';
import { SignoutResponseDto } from './dto/signout.response.dto';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';

@Controller('users')
export class SignoutController {
  constructor(private readonly signoutUseCase: SignoutUseCase) {}

  @Delete('me')
  async deleteUser() {
    const entity = await this.signoutUseCase.signoutUser();
    if (entity) {
      return new SignoutResponseDto('200', 'OK');
    }
  }
}
