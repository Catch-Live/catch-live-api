import { BadRequestException } from '@nestjs/common';
import { RequestErrorCode } from './request-error-code';
import { getErrorMessage } from 'src/support/error-message.util';

export class RequestCustomException extends BadRequestException {
  constructor(public readonly errorCode: RequestErrorCode) {
    const errorMessage = getErrorMessage(errorCode);
    super({ errorMessage });
  }
}
