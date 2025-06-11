import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ProfileService } from 'src/domain/profile/profile.service';
import { ProfileCoreRepository } from 'src/infrastructure/profile/profile.core-repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileUseCase, ProfileService, ProfileCoreRepository],
  exports: [ProfileService],
})
export class ProfileModule {}
