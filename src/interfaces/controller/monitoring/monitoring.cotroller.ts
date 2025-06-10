import { Controller, Get } from '@nestjs/common';

@Controller('monitorings')
export class MonitoringController {
  @Get('/health')
  healthCheck() {
    return 'OK';
  }
}
