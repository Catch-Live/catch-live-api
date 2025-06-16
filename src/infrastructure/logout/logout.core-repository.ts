import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { LogoutRepository } from 'src/domain/auth/logout.repo';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { LogoutRequestCommand } from 'src/domain/auth/command/logout.command';
import { LogoutResponseEntity } from 'src/domain/auth/entity/logout.entity';

@Injectable()
export class LogoutCoreRepository implements LogoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logout(requestCommand: LogoutRequestCommand) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        const rawData = await prisma.token.updateMany({
          where: {
            user_id: requestCommand.userId,
          },
          data: { refresh_token: '', updated_at: new Date() },
        });

        if (rawData.count === 0 || rawData.count > 1) {
          throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
        }
      });
    } catch {
      throw new DomainCustomException(500, DomainErrorCode.DB_SERVER_ERROR);
    }

    return new LogoutResponseEntity(true);
  }
}
