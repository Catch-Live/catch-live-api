import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SOCIAL_LOGIN_STRATEGY, SocialLoginStrategy } from './social-login.strategy';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class SocialLoginFactory {
  constructor(
    @Inject(SOCIAL_LOGIN_STRATEGY)
    private readonly strategies: SocialLoginStrategy[]
  ) {}

  findByProvider(provider: string): SocialLoginStrategy {
    const strategy = this.strategies.find((s) => s.supports(provider));
    if (!strategy) {
      throw new DomainCustomException(HttpStatus.BAD_REQUEST, DomainErrorCode.INVALID_PROVIDER);
    }
    return strategy;
  }
}
