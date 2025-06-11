import { Cron } from '@nestjs/schedule';
import axios from 'axios';

export class HealthCheckScheduler {
  @Cron('*/60 * * * * *') //  1분 마다 헬스체크 진행
  async healthCheck() {
    try {
      const monitoringUrl = process.env.MONITORING_BASE_URL;
      const res = await axios.get(`${monitoringUrl}/api/v1/monitorings/health`);

      console.log('🟢 Monitoring Server Health OK:', res.status);
    } catch (e) {
      console.error('🔴 Monitoring Server DOWN', e.message);
    }
  }
}
