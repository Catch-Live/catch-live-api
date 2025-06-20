import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { RequestErrorCode } from '../errors/request-error-code';

export class ResultResponseDto<T> {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly data?: T
  ) {}

  static success<T>(data?: T): ResultResponseDto<T> {
    return new ResultResponseDto('0000', 'SUCCESS', data);
  }

  static error<T>(
    code: DomainErrorCode | RequestErrorCode = DomainErrorCode.COMMON_ERROR,
    message: string,
    data?: T
  ): ResultResponseDto<T> {
    return new ResultResponseDto(code, message, data);
  }
}
