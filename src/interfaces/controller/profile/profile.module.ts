import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ProfileService } from 'src/domain/profile/profile.service';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';
import { PROFILE_REPOSITORY } from 'src/domain/profile/profile.repo';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [
    ProfileUseCase,
    ProfileService,
    ProfileCoreRepository,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileCoreRepository,
    },
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
