import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/domain/auth/auth.service';
import { SocialLoginCommand } from 'src/domain/auth/command/social-login.command';
import { LoginToken } from 'src/domain/auth/login-token';
import { NeedSignupResponse } from 'src/domain/auth/need-signup.response';
import { UserEntity } from 'src/domain/user/user.entity';
import { UserService } from 'src/domain/user/user.service';
import { JwtUtil } from 'src/support/jwt.util';
import { LogoutRequestCommand } from 'src/domain/auth/command/logout.command';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly jwtUtil: JwtUtil
  ) {}

  async loginWithSocial(command: SocialLoginCommand): Promise<LoginToken | NeedSignupResponse> {
    const { provider, authorizationCode, state } = command;

    const accessToken = await this.authService.getAccessToken(provider, authorizationCode, state);

    const userInfo = await this.authService.getUserInfo(provider, accessToken);

    const user: UserEntity | null = await this.userService.getUserByProviderAndEmail(
      provider,
      userInfo.email
    );

    if (!user) {
      return {
        needSignup: true,
        user: {
          email: userInfo.email,
        },
      };
    }

    const loginToken: LoginToken = this.jwtUtil.generateLoginToken({
      userId: user.userId,
      email: user.email,
      provider: user.provider,
    });

    await this.userService.saveRefreshToken(user.userId, loginToken.refreshToken);

    return loginToken;
  }

  async logout(requestCommand: LogoutRequestCommand) {
    return await this.authService.logout(requestCommand);
  }
}
