import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ResultResponseDto } from '../dto/result.response.dto';
import { RequestCustomException } from '../errors/request-custom-exception';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { getErrorMessage } from 'src/support/error-message.util';
import { DomainErrorCode, DomainErrorMessage } from 'src/domain/common/errors/domain-error-code';
import { RequestErrorCode } from '../errors/request-error-code';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    let errorCode: DomainErrorCode | RequestErrorCode = DomainErrorCode.COMMON_ERROR;
    let errorMessage = DomainErrorMessage[errorCode];

    if (exception instanceof HttpException) {
      errorMessage = exception.message;
    }

    if (exception instanceof RequestCustomException || exception instanceof DomainCustomException) {
      errorCode = exception.errorCode;
      errorMessage = getErrorMessage(errorCode);
    }

    const responseDto = ResultResponseDto.error(errorCode, errorMessage);
    response.status(statusCode).json(responseDto);
  }
}
