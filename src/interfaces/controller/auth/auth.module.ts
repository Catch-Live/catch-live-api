import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthUseCase } from 'src/application/auth/auth.use-case';
import { UserModule } from '../user/user.module';
import { AuthService } from 'src/domain/auth/auth.service';
import { JwtUtil } from 'src/support/jwt.util';
import { JwtModule } from '@nestjs/jwt';
import { SocialLoginFactory } from 'src/domain/auth/strategy/social-login.factory';
import { KakaoStrategy } from 'src/infrastructure/auth/strategy/kakao-login.strategy';
import { NaverStrategy } from 'src/infrastructure/auth/strategy/naver-login.strategy';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google-login.strategy';
import { JwtStrategy } from 'src/interfaces/controller/common/guards/jwt.strategy';
import { SOCIAL_LOGIN_STRATEGY } from 'src/domain/auth/strategy/social-login.strategy';
import { ProfileModule } from 'src/interfaces/controller/profile/profile.module';
import { LogoutService } from 'src/domain/auth/logout.service';
import { LogoutCoreRepository } from 'src/infrastructure/logout/logout.core-repository';
import { LOGOUT_REPOSITORY } from 'src/domain/auth/logout.repo';

@Module({
  imports: [UserModule, ProfileModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthUseCase,
    AuthService,
    JwtUtil,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
    JwtStrategy,
    {
      provide: SOCIAL_LOGIN_STRATEGY,
      useFactory: (kakao: KakaoStrategy, naver: NaverStrategy, google: GoogleStrategy) => [
        kakao,
        naver,
        google,
      ],
      inject: [KakaoStrategy, NaverStrategy, GoogleStrategy],
    },
    SocialLoginFactory,
    LogoutService,
    {
      provide: LOGOUT_REPOSITORY,
      useClass: LogoutCoreRepository,
    },
  ],
})
export class AuthModule {}
