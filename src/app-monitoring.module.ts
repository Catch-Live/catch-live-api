import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringScheduler } from './interfaces/scheduler/monitoring-scheduler';
import { MonitoringModule } from './interfaces/controller/monitoring/monitoring.module';

@Module({
  imports: [MonitoringModule, PrismaModule, ScheduleModule.forRoot()],
  providers: [MonitoringScheduler],
})
export class AppMonitoringModule {}
