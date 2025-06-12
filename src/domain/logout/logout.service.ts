import { Injectable, Inject } from '@nestjs/common';
import { LogoutResponseResult } from 'src/domain/logout/result/logout.response.result';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { LogoutRepository, LOGOUT_REPOSITORY } from './logout.repo';

@Injectable()
export class LogoutService {
  constructor(@Inject(LOGOUT_REPOSITORY) private readonly logoutRepository: LogoutRepository) {}

  async logoutUser(requestDto: LogoutRequestDto) {
    try {
      const data = await this.logoutRepository.updateMany(requestDto);
      if (data.is_updated === true) {
        return new LogoutResponseResult(true);
      } else {
        throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
      }
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }
  }
}
