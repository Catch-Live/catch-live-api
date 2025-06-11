import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserUseCase } from 'src/application/user/user.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { SignoutService } from 'src/domain/signout/signout.service';
import { SignoutCoreRepository } from 'src/infrastructure/signout/signout.core-repository';
import { SIGNOUT_REPOSITORY } from 'src/domain/signout/signout.repo';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserUseCase,
    SignoutService,
    {
      provide: SIGNOUT_REPOSITORY,
      useClass: SignoutCoreRepository,
    },
  ],
})
export class UserModule {}
