import { Injectable, Inject } from '@nestjs/common';
import { SignoutResponseResult } from 'src/domain/signout/result/signout.response.result';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { SignoutRepository, SIGNOUT_REPOSITORY } from './signout.repo';

@Injectable()
export class SignoutService {
  constructor(@Inject(SIGNOUT_REPOSITORY) private readonly signoutRepository: SignoutRepository) {}

  async signoutUser(requestDto: UserRequestDto) {
    try {
      await this.signoutRepository.updateMany(requestDto);
      return new SignoutResponseResult(true);
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }
  }
}
