import { Injectable } from '@nestjs/common';
import { UserService } from 'src/domain/user/user.service';
import { UserRequestCommand } from 'src/domain/user/user.command';

@Injectable()
export class UserUseCase {
  constructor(private readonly userService: UserService) {}

  async signout(requestDto: UserRequestCommand) {
    return await this.userService.signout(requestDto);
  }
}
