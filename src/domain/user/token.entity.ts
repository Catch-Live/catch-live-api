import { HttpStatus } from '@nestjs/common';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';
import * as bcrypt from 'bcrypt';

export class TokenEntity {
  constructor(
    public readonly tokenId: number,
    public readonly userId: number,
    public readonly refreshToken: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  async compare(token: string) {
    if (await bcrypt.compare(token, this.refreshToken)) {
      throw new DomainCustomException(HttpStatus.UNAUTHORIZED, DomainErrorCode.UNAUTHORIZED);
    }

    return this;
  }
}
