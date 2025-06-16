import { Inject, Injectable } from '@nestjs/common';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { SignoutRequestCommand } from 'src/domain/signout/command/signout.command';
import { SIGNOUT_REPOSITORY, SignoutRepository } from 'src/domain/signout/signout.repo';
import { resultFromEntity } from './result/signout.result';

@Injectable()
export class SignoutService {
  constructor(@Inject(SIGNOUT_REPOSITORY) private readonly signoutRepository: SignoutRepository) {}

  async signoutUser(command: SignoutRequestCommand) {
    try {
      const queryData = await this.signoutRepository.updateMany(command);
      if (!queryData.is_updated) {
        throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
      }
      return resultFromEntity(queryData);
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }
  }
}
