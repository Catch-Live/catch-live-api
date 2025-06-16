import { Injectable } from '@nestjs/common';
import { SignoutService } from 'src/domain/signout/signout.service';
import { SignoutRequestCommand } from 'src/domain/signout/command/signout.command';

@Injectable()
export class UserUseCase {
  constructor(private readonly signoutService: SignoutService) {}

  async signoutUser(requestDto: SignoutRequestCommand) {
    return await this.signoutService.signoutUser(requestDto);
  }
}
