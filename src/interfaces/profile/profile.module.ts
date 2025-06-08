import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileUseCase],
})
export class ProfileModule {}
