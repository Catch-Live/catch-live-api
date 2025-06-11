import { Module } from '@nestjs/common';
import { SignoutController } from './signout.controller';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { SignoutService } from 'src/domain/signout/signout.service';
import { SignoutCoreRepository } from 'src/infrastructure/signout/signout.core-repository';
import { SIGNOUT_REPOSITORY } from 'src/domain/signout/signout.repo';

@Module({
  imports: [PrismaModule],
  controllers: [SignoutController],
  providers: [
    SignoutUseCase,
    SignoutService,
    {
      provide: SIGNOUT_REPOSITORY,
      useClass: SignoutCoreRepository,
    },
  ],
})
export class SignoutModule {}
