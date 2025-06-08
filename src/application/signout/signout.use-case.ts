import { Injectable } from '@nestjs/common';

@Injectable()
export class SignoutUseCase {
  signoutUser() {
    return { code: '200', message: 'ok' };
  }
}
