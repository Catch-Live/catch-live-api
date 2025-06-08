import { Module } from '@nestjs/common';
import { SignoutController } from './signout.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SignoutController],
})
export class SignoutModule {}
