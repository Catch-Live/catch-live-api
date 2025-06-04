import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';

@Module({
  imports: [RecordingModule, SubscriptionModule, PrismaModule],
})
export class AppModule {}
