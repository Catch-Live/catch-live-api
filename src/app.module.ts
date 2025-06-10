import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckScheduler } from './interfaces/scheduler/health-check-scheduler';
import { RecordingModule } from './interfaces/controller/recording/recording.module';
import { SubscriptionModule } from './interfaces/controller/subscription/subscription.module';
import { AuthModule } from './interfaces/controller/auth/auth.module';
import { UserModule } from './interfaces/controller/user/user.module';

@Module({
  imports: [
    RecordingModule,
    SubscriptionModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ScheduleModule.forRoot(),
  ],
  providers: [HealthCheckScheduler],
})
export class AppModule {}
