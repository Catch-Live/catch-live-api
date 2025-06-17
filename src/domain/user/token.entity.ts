import { HttpStatus, Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(TokenEntity.name);

  async compare(token: string) {
    try {
      await bcrypt.compare(token, this.refreshToken);
    } catch {
      this.logger.error('Refresh Token 불일치');
      throw new DomainCustomException(HttpStatus.UNAUTHORIZED, DomainErrorCode.UNAUTHORIZED);
    }

    return this;
  }
}
