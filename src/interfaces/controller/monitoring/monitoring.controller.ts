import { Controller, Get } from '@nestjs/common';
import { MonitoringUseCase } from 'src/application/monitoring/monitoring.use-case';

@Controller('monitorings')
export class MonitoringController {
  constructor(private readonly monitoringUseCase: MonitoringUseCase) {}

  @Get('/health')
  healthCheck() {
    return 'OK';
  }
}
