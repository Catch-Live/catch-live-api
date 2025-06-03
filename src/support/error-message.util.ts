import { DomainErrorCode, DomainErrorMessage } from 'src/domain/common/errors/domain-error-code';
import {
  RequestErrorCode,
  RequestErrorMessage,
} from 'src/interfaces/common/errors/request-error-code';

export function getErrorMessage(code: string, fallback = '알 수 없는 에러입니다.') {
  return (
    DomainErrorMessage[code as DomainErrorCode] ||
    RequestErrorMessage[code as RequestErrorCode] ||
    fallback
  );
}
