import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringModule } from './interfaces/controller/monitoring/monitoring.module';
import { StreamerModule } from './interfaces/controller/streamer/streamer.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MonitoringScheduler } from './interfaces/scheduler/monitoring-scheduler';

@Module({
  imports: [MonitoringModule, PrismaModule, StreamerModule, RedisModule, ScheduleModule.forRoot()],
  exports: [MonitoringModule, StreamerModule],
  providers: [MonitoringScheduler],
})
export class AppMonitoringModule {}
