import { BadRequestException } from '@nestjs/common';

export class RequestCustomException extends BadRequestException {
  constructor(errorMessage: string) {
    super({ errorMessage });
  }
}
