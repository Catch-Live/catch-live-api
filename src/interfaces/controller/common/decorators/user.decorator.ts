import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/support/jwt.util';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    return request.user?.userId ?? null;
  }
);
