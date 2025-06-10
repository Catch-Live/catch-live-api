import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET 환경변수가 설정되어 있지 않습니다.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          const token = req?.headers?.accesstoken;
          if (!token) return null;
          if (Array.isArray(token)) return token[0];
          return token;
        },
      ]),
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: { userId: number; email: string; provider: string } }) {
    const { userId, email, provider } = payload.sub ?? {};
    if (!userId || !email || !provider) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }
    return { userId, email, provider };
  }
}
