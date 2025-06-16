import { Module } from '@nestjs/common';
import { UserController } from 'src/interfaces/controller/user/user.controller';
import { UserUseCase } from 'src/application/user/user.use-case';
import { SignoutService } from 'src/domain/signout/signout.service';
import { SIGNOUT_REPOSITORY } from 'src/domain/signout/signout.repo';
import { SignoutCoreRepository } from 'src/infrastructure/signout/signout.core-repository';

@Module({
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
