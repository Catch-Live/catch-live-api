import { Injectable, Inject } from '@nestjs/common';
import { SignoutResponseResult } from 'src/domain/signout/result/signout.response.result';
import { SignoutRequestDto } from 'src/interfaces/controller/signout/dto/signout.request.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { SignoutRepository, SIGNOUT_REPOSITORY } from './signout.repo';

@Injectable()
export class SignoutService {
  constructor(@Inject(SIGNOUT_REPOSITORY) private readonly signoutRepository: SignoutRepository) {}

  async signoutUser(requestDto: SignoutRequestDto) {
    try {
      const data = await this.signoutRepository.updateMany(requestDto);
      if (data.is_updated === true) {
        return new SignoutResponseResult(true);
      } else {
        throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
      }
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }
  }
}
