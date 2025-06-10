import { Injectable } from '@nestjs/common';
import { Provider } from 'src/domain/user/user.entity';
import { SocialLoginFactory } from './strategy/social-login.factory';

@Injectable()
export class AuthService {
  constructor(private readonly socialLoginFactory: SocialLoginFactory) {}

  async getAccessToken(
    provider: Provider,
    authorizationCode: string,
    state?: string
  ): Promise<string> {
    const strategy = this.socialLoginFactory.findByProvider(provider);
    return await strategy.getAccessToken(authorizationCode, state);
  }

  async getUserInfo(provider: Provider, accessToken: string): Promise<{ email: string }> {
    const strategy = this.socialLoginFactory.findByProvider(provider);
    return await strategy.getUserInfo(accessToken);
  }
}
