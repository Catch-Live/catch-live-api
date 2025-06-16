import { Injectable, Inject } from '@nestjs/common';
import { SignoutResponseResult } from 'src/domain/signout/result/signout.result';
import { SignoutRequestCommand } from './command/signout.command';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { SignoutRepository, SIGNOUT_REPOSITORY } from './signout.repo';

@Injectable()
export class SignoutService {
  constructor(@Inject(SIGNOUT_REPOSITORY) private readonly signoutRepository: SignoutRepository) {}

  async signoutUser(command: SignoutRequestCommand) {
    try {
      const result = await this.signoutRepository.updateMany(command);
      if (!result.is_updated) {
        throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
      }
      return result as SignoutResponseResult;
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }
  }
}
