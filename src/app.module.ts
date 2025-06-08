import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';
import { SignoutModule } from './interfaces/signout/signout.module';

@Module({
  imports: [RecordingModule, SubscriptionModule, SignoutModule, PrismaModule],
})
export class AppModule {}
