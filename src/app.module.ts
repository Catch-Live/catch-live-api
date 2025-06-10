import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { NotificationModule } from './interfaces/notification/notification.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';
import { AuthModule } from './interfaces/auth/auth.module';
import { UserModule } from './interfaces/user/user.module';

@Module({
  imports: [
    RecordingModule,
    SubscriptionModule,
    NotificationModule,
    PrismaModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
