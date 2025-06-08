import { Module } from '@nestjs/common';
import { SignoutController } from './signout.controller';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SignoutController],
  providers: [SignoutUseCase],
})
export class SignoutModule {}
