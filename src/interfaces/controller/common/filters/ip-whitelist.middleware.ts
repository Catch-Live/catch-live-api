import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 모니터링 서버에 메인 서버만 접근 가능하도록 IP 제한
@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  private readonly allowedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  use(req: Request, res: Response, next: NextFunction) {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : rawIp;
    const normalizedIp = clientIp
      .replace(/^::ffff:/, '')
      .split(',')[0]
      .trim();

    if (!this.allowedIps.includes(normalizedIp)) {
      throw new ForbiddenException(`Access denied from IP: ${normalizedIp}`);
    }

    next();
  }
}
