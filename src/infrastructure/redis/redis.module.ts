import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CACHE_SERVICE } from 'src/domain/common/cache/cache.service';
import { RECORDING_QUEUE_CLIENT } from 'src/domain/recording/client/recording-queue.client';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: RedisService,
    },
    {
      provide: RECORDING_QUEUE_CLIENT,
      useClass: RedisService,
    },
  ],
  exports: [CACHE_SERVICE, RECORDING_QUEUE_CLIENT],
})
export class RedisModule {}
