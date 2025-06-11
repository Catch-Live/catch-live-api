import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/domain/user/user.repository';
import { UserService } from 'src/domain/user/user.service';
import { UserCoreRepository } from 'src/infrastructure/user/user.core-repository';

@Module({
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserCoreRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
