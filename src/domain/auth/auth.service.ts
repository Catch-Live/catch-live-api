import { Injectable, Inject } from '@nestjs/common';
import { Provider } from 'src/domain/user/user.entity';
import { SocialLoginFactory } from './strategy/social-login.factory';
import { USER_REPOSITORY, UserRepository } from '../user/user.repository';
import { LogoutRequestCommand } from './command/logout.command';
import { LogoutResponseResult } from './result/logout.response.result';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class AuthService {
  constructor(
    private readonly socialLoginFactory: SocialLoginFactory,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async getOauthAccessToken(
    provider: Provider,
    authorizationCode: string,
    state?: string
  ): Promise<string> {
    const strategy = this.socialLoginFactory.findByProvider(provider);
    return await strategy.getAccessToken(authorizationCode, state);
  }

  async getOauthUserInfo(provider: Provider, accessToken: string): Promise<{ email: string }> {
    const strategy = this.socialLoginFactory.findByProvider(provider);
    return await strategy.getUserInfo(accessToken);
  }

  async logout(requestCommand: LogoutRequestCommand) {
    const entity = await this.userRepository.logout(requestCommand);
    if (entity) {
      return new LogoutResponseResult(true);
    } else {
      throw new DomainCustomException(404, DomainErrorCode.USER_NOT_FOUND);
    }
  }
}
