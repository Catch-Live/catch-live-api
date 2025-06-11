import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { LoginToken } from 'src/domain/auth/login-token';
import { Provider } from 'src/domain/user/user.entity';

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateLoginToken(subject: { userId: number; email: string; provider: Provider }): LoginToken {
    const accessToken = this.generateAccessToken(subject);
    const refreshToken = this.generateRefreshToken(subject);
    return { refreshToken, accessToken };
  }

  generateAccessToken(subject: { userId: number; email: string; provider: Provider }): string {
    return this.createToken(
      subject,
      process.env.JWT_ACCESS_EXPIRES_IN!,
      process.env.JWT_ACCESS_SECRET!
    );
  }

  generateRefreshToken(subject: { userId: number; email: string; provider: Provider }): string {
    return this.createToken(
      subject,
      process.env.JWT_REFRESH_EXPIRES_IN!,
      process.env.JWT_REFRESH_SECRET!
    );
  }

  private createToken(
    subject: { userId: number; email: string; provider: Provider },
    expiresIn: string,
    secret: string
  ): string {
    return this.jwtService.sign(
      { sub: subject },
      {
        secret,
        expiresIn,
        header: { alg: 'HS256', typ: 'JWT' },
      }
    );
  }
}
