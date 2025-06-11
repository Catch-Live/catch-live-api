import { Injectable } from '@nestjs/common';
import { SignoutService } from 'src/domain/signout/signout.service';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';

@Injectable()
export class UserUseCase {
  constructor(private readonly signoutService: SignoutService) {}

  async signoutUser(requestDto: UserRequestDto) {
    return await this.signoutService.signoutUser(requestDto);
  }
}
