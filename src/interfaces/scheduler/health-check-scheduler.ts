import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { SERVER_URL } from 'src/support/constants';

export class HealthCheckScheduler {
  @Cron('*/30 * * * * *') //  30초 마다 헬스체크 진행
  async healthCheck() {
    try {
      const MONITORING_BASE_URL = SERVER_URL.MONITORING.BASE;
      const res = await axios.get(`${MONITORING_BASE_URL}/api/v1/monitorings/health`);

      console.log('🟢 Monitoring Server Health OK:', res.status);
    } catch (e) {
      console.error('🔴 Monitoring Server DOWN', e.message);
    }
  }
}
