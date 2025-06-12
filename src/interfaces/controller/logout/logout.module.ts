import { Module } from '@nestjs/common';
import { LogoutController } from './logout.controller';
import { LogoutUseCase } from 'src/application/logout/logout.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LogoutService } from 'src/domain/logout/logout.service';
import { LogoutCoreRepository } from 'src/infrastructure/logout/logout.core-repository';
import { LOGOUT_REPOSITORY } from 'src/domain/logout/logout.repo';

@Module({
  imports: [PrismaModule],
  controllers: [LogoutController],
  providers: [
    LogoutUseCase,
    LogoutService,
    {
      provide: LOGOUT_REPOSITORY,
      useClass: LogoutCoreRepository,
    },
  ],
})
export class LogoutModule {}
