import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/domain/auth/auth.service';
import { SocialLoginCommand } from 'src/domain/auth/command/social-login.command';
import { LoginToken } from 'src/domain/auth/login-token';
import { NeedSignupResponse } from 'src/domain/auth/need-signup.response';
import { UserEntity } from 'src/domain/user/user.entity';
import { UserService } from 'src/domain/user/user.service';
import { JwtUtil } from 'src/support/jwt.util';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly jwtUtil: JwtUtil
  ) {}

  async loginWithSocial(command: SocialLoginCommand): Promise<LoginToken | NeedSignupResponse> {
    const { provider, authorizationCode, state } = command;

    // 1. OAuth 인증 서버로 AccessToken 요청
    const accessToken = await this.authService.getAccessToken(provider, authorizationCode, state);

    // 2. AccessToken으로 사용자 정보 요청
    const userInfo = await this.authService.getUserInfo(provider, accessToken);

    // 3. 유저 조회
    const user: UserEntity | null = await this.userService.getUserByProviderAndEmail(
      provider,
      userInfo.email
    );

    // 4. 유저정보 없으면 email리턴
    if (!user) {
      return {
        needSignup: true,
        user: {
          email: userInfo.email,
        },
      };
    }

    // 5. JWT 발급
    const loginToken: LoginToken = this.jwtUtil.generateLoginToken({
      userId: user.userId,
      email: user.email,
      provider: user.provider,
    });

    return loginToken;
  }
}
