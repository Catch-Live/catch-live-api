import { HttpStatus } from '@nestjs/common';
import { HttpStatusMessage } from 'src/support/http-status-message.util';

export class ResultResponseDto<T> {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly data: T
  ) {}

  static success<T>(data: T, code = HttpStatus.OK): ResultResponseDto<T> {
    const message = HttpStatusMessage[code] ?? 'OK';

    return new ResultResponseDto(code, message, data);
  }

  static error<T>(data?: T, code = HttpStatus.INTERNAL_SERVER_ERROR): ResultResponseDto<T> {
    const message = HttpStatusMessage[code] ?? 'INTERNAL_SERVER_ERROR';

    return new ResultResponseDto(code, message, data ?? ({} as T));
  }
}
