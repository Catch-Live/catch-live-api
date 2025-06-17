import { Body, Controller, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { AuthUseCase } from 'src/application/auth/auth.use-case';
import { SocialLoginDto } from './dto/auth.social-login.dto';
import { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_TTL } from 'src/support/constants';
import { isNeedSignupResponse } from 'src/domain/auth/need-signup.response';
import { SignupDto } from './dto/auth.signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  private readonly logger = new Logger(AuthController.name);

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
      .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
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

  @Post('tokens/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const { refreshToken } = req.cookies;
      const data = await this.authUseCase.refresh(refreshToken);

      res.status(HttpStatus.CREATED).json(ResultResponseDto.success(data));
    } catch (error) {
      this.logger.error('AccessToken refresh 실패', error);
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
      throw error;
    }
  }
}
