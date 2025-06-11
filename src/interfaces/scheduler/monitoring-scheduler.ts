import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MonitoringUseCase } from 'src/application/monitoring/monitoring.use-case';

@Injectable()
export class MonitoringScheduler {
  constructor(private readonly monitoringUseCase: MonitoringUseCase) {}

  @Cron('*/10 * * * * *') // 10초마다 실행
  recordLiveStreams() {
    this.monitoringUseCase.recordLiveStreams();
  }
}
