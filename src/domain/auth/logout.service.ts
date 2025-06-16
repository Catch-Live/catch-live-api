import { Injectable, Inject } from '@nestjs/common';
import { LogoutResponseResult } from 'src/domain/auth/result/logout.response.result';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { LogoutRepository, LOGOUT_REPOSITORY } from './logout.repo';
import { LogoutRequestCommand } from './command/logout.command';

@Injectable()
export class LogoutService {
  constructor(@Inject(LOGOUT_REPOSITORY) private readonly logoutRepository: LogoutRepository) {}

  async logout(requestCommand: LogoutRequestCommand) {
    const data = await this.logoutRepository.logout(requestCommand);
    if (data.is_updated === true) {
      return new LogoutResponseResult(data.is_updated);
    } else {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }
  }
}
