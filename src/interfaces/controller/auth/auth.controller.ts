import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { AuthUseCase } from 'src/application/auth/auth.use-case';
import { SocialLoginDto } from './dto/auth.social-login.dto';
import { Response } from 'express';
import { REFRESH_TOKEN_COOKIE_TTL } from 'src/support/constants';
import { isNeedSignupResponse } from 'src/domain/auth/need-signup.response';
import { SignupDto } from './dto/auth.signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('login')
  async login(@Body() socialLoginDto: SocialLoginDto, @Res() res: Response): Promise<void> {
    const command = socialLoginDto.toCommand();
    const result = await this.authUseCase.loginWithSocial(command);

    if (isNeedSignupResponse(result)) {
      res.status(HttpStatus.OK).json(ResultResponseDto.success(result));
      return;
    }

    const { accessToken, refreshToken } = result;

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: REFRESH_TOKEN_COOKIE_TTL,
      })
      .status(HttpStatus.OK)
      .json(ResultResponseDto.success({ needSignup: false, accessToken }));
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const command = signupDto.toCommand();
    await this.authUseCase.signup(command);

    res.status(HttpStatus.CREATED).json(ResultResponseDto.success());
  }
}
