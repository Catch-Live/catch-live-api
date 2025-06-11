import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { ProfileService } from 'src/domain/profile/profile.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly profileService: ProfileService) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET 환경변수가 설정되어 있지 않습니다.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: { userId: number; email: string; provider: string } }) {
    const { userId, email, provider } = payload.sub ?? {};
    if (!userId || !email || !provider) {
      throw new DomainCustomException(401, DomainErrorCode.UNAUTHORIZED);
    }

    return { userId, email, provider };
  }
}
