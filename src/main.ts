import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { API_PREFIX } from './support/constants';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { RequestErrorCode } from './interfaces/controller/common/errors/request-error-code';
import { RequestCustomException } from './interfaces/controller/common/errors/request-custom-exception';
import { HttpExceptionFilter } from './interfaces/controller/common/filters/http-exception.filter';
import { FieldConstraintErrorMap } from './interfaces/controller/common/dto/field-error-map';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  // api path에 prefix 설정
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      // POJO 객체를 DTO 클래스로 자동 변환
      transform: true,
      // Request Params 검증할 떄 에러메시지 직접 핸들링
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const field = firstError.property;
        const constraints = firstError.constraints ?? {};

        // constraints key들 중 첫 번째를 기준으로 메시지 추출
        const constraintKey = Object.keys(constraints)[0];
        const code =
          FieldConstraintErrorMap[field]?.[constraintKey] ?? RequestErrorCode.INVALID_QUERY_STRING;

        return new RequestCustomException(code);
      },
    })
  );
  // 전역 ExceptionFilter 등록
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.set('trust proxy', true);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
