import { Inject, Injectable } from '@nestjs/common';
import { SOCIAL_LOGIN_STRATEGY, SocialLoginStrategy } from './social-login.strategy';
import { RequestCustomException } from 'src/interfaces/controller/common/errors/request-custom-exception';

@Injectable()
export class SocialLoginFactory {
  constructor(
    @Inject(SOCIAL_LOGIN_STRATEGY)
    private readonly strategies: SocialLoginStrategy[]
  ) {}

  findByProvider(provider: string): SocialLoginStrategy {
    const strategy = this.strategies.find((s) => s.supports(provider));
    if (!strategy) {
      throw new RequestCustomException('지원하지 않는 소셜 로그인입니다.');
    }
    return strategy;
  }
}
