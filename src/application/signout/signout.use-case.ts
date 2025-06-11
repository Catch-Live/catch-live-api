import { Injectable } from '@nestjs/common';
import { SignoutService } from 'src/domain/signout/signout.service';
import { SignoutRequestDto } from 'src/interfaces/controller/signout/dto/signout.request.dto';

@Injectable()
export class SignoutUseCase {
  constructor(private readonly signoutService: SignoutService) {}

  async signoutUser(requestDto: SignoutRequestDto) {
    return await this.signoutService.signoutUser(requestDto);
  }
}
