import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ResultResponseDto } from '../dto/result.response.dto';
import { RequestCustomException } from '../errors/request-custom-exception';
import { DomainCustomExceptionn } from 'src/domain/common/errors/domain-custom-exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    let errorMessage = '서버에서 요청을 처리할 수 없습니다.';

    if (exception instanceof RequestCustomException) {
      const res = exception.getResponse();
      if (isErrorMessageObject(res)) {
        errorMessage = res.errorMessage;
      }
    }

    if (exception instanceof DomainCustomExceptionn) {
      errorMessage = exception.message;
    }

    const responseDto = ResultResponseDto.error({ errorMessage }, statusCode);
    response.status(statusCode).json(responseDto);
  }
}

function isErrorMessageObject(obj: any): obj is { errorMessage: string } {
  return typeof obj === 'object' && obj !== null && 'errorMessage' in obj;
}
