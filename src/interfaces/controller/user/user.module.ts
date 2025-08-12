import { Module } from '@nestjs/common';
import { UserController } from 'src/interfaces/controller/user/user.controller';
import { UserUseCase } from 'src/application/user/user.use-case';
import { UserService } from 'src/domain/user/user.service';
import { USER_REPOSITORY } from 'src/domain/user/user.repository';
import { UserCoreRepository } from 'src/infrastructure/user/user.core-repository';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCase,
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserCoreRepository,
    },
  ],
  exports: [UserUseCase, UserService],
})
export class UserModule {}
