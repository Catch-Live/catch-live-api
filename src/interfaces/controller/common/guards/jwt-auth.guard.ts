import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw new DomainCustomException(401, DomainErrorCode.UNAUTHORIZED);
    }
    return user;
  }
}
