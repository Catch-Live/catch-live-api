import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { LoginToken } from 'src/domain/auth/login-token';

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateLoginToken(subject: JwtPayload): LoginToken {
    const accessToken = this.generateAccessToken(subject);
    const refreshToken = this.generateRefreshToken(subject);
    return { refreshToken, accessToken };
  }

  generateAccessToken(subject: JwtPayload): string {
    return this.createToken(
      subject,
      process.env.JWT_ACCESS_EXPIRES_IN!,
      process.env.JWT_ACCESS_SECRET!
    );
  }

  generateRefreshToken(subject: JwtPayload): string {
    return this.createToken(
      subject,
      process.env.JWT_REFRESH_EXPIRES_IN!,
      process.env.JWT_REFRESH_SECRET!
    );
  }

  private createToken(subject: JwtPayload, expiresIn: string, secret: string): string {
    return this.jwtService.sign(subject, {
      secret,
      expiresIn,
      header: { alg: 'HS256', typ: 'JWT' },
    });
  }
}

export type JwtPayload = {
  userId: number;
  provider: string;
};
