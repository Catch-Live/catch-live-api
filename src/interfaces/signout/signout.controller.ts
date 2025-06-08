import { Controller, Delete } from '@nestjs/common';
import { SignoutResponseDto } from './dto/signout.response.dto';

@Controller('users')
export class SignoutController {
  @Delete('me')
  deleteUser() {
    const res: SignoutResponseDto = { code: '200', message: 'ok' };
    return res;
  }
}
