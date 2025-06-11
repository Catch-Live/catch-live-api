import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';
import { SignoutModule } from './interfaces/signout/signout.module';
import { ProfileModule } from './interfaces/controller/profile/profile.module';
import { AuthModule } from './interfaces/controller/auth/auth.module';
import { UserModule } from './interfaces/controller/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckScheduler } from './interfaces/scheduler/health-check-scheduler';
import { RecordingModule } from './interfaces/controller/recording/recording.module';

@Module({
  imports: [
    RecordingModule,
    SubscriptionModule,
    ProfileModule,
    PrismaModule,
    AuthModule,
    UserModule,
    SignoutModule,
    ScheduleModule.forRoot(),
  ],
  providers: [HealthCheckScheduler],
})
export class AppModule {}
