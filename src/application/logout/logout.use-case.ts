import { Injectable } from '@nestjs/common';
import { LogoutService } from 'src/domain/logout/logout.service';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly logoutService: LogoutService) {}

  async logoutUser(requestDto: LogoutRequestDto) {
    return await this.logoutService.logoutUser(requestDto);
  }
}
