import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SubscriptionModule } from './interfaces/controller/subscription/subscription.module';
import { ProfileModule } from './interfaces/controller/profile/profile.module';
import { AuthModule } from './interfaces/controller/auth/auth.module';
import { UserModule } from './interfaces/controller/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckScheduler } from './interfaces/scheduler/health-check-scheduler';
import { RecordingModule } from './interfaces/controller/recording/recording.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { StreamerModule } from './interfaces/controller/streamer/streamer.module';

@Module({
  imports: [
    RecordingModule,
    SubscriptionModule,
    ProfileModule,
    PrismaModule,
    StreamerModule,
    AuthModule,
    RedisModule,
    UserModule,
    ScheduleModule.forRoot(),
  ],
  providers: [HealthCheckScheduler],
})
export class AppModule {}
