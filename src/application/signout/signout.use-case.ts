import { Injectable } from '@nestjs/common';
import { SignoutService } from 'src/domain/signout/signout.service';

@Injectable()
export class SignoutUseCase {
  constructor(private readonly signoutService: SignoutService) {}

  async signoutUser() {
    return await this.signoutService.getSignout();
  }
}
