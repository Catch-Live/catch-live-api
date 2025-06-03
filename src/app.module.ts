import { Module } from '@nestjs/common';
import { SubscriptionModule } from './interface/subscription/subscription.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [SubscriptionModule, PrismaModule],
})
export class AppModule {}
