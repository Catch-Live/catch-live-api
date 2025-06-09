import { Body, Controller, Post, Res } from '@nestjs/common';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { AuthUseCase } from 'src/application/auth/auth.use-case';
import { SocialLoginDto } from './dto/auth.social-login.dto';
import { Response } from 'express';
import { REFRESH_TOKEN_COOKIE_TTL } from 'src/support/constants';
import { isNeedSignupResponse } from 'src/domain/auth/need-signup.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('login')
  async login(
    @Body()
    socialLoginDto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResultResponseDto<any>> {
    const command = socialLoginDto.toCommand();
    const result = await this.authUseCase.loginWithSocial(command);

    if (isNeedSignupResponse(result)) {
      return ResultResponseDto.success(result);
    }

    const { accessToken, refreshToken } = result;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_COOKIE_TTL,
    });

    return ResultResponseDto.success({ accessToken });
  }
}
