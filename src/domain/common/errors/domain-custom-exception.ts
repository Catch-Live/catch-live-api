import { HttpException } from '@nestjs/common';
import { DomainErrorCode } from './domain-error-code';
import { getErrorMessage } from 'src/support/error-message.util';

export class DomainCustomException extends HttpException {
  code: any;
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: DomainErrorCode
  ) {
    const errorMessage = getErrorMessage(errorCode);
    super(errorMessage, statusCode);
  }
}
