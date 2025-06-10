import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MonitoringController } from './monitoring.cotroller';
import { IpWhitelistMiddleware } from '../common/filters/ ip-whitelist.middleware';
import { MonitoringUseCase } from 'src/application/monitoring/monitoring.use-case';
import { StreamerService } from 'src/domain/streamer/streamer.service';
import { STREAMER_REPOSITORY } from 'src/domain/streamer/streamer.repository';
import { StreamerCoreRepository } from 'src/infrastructure/streamer/streamer.core-repository';
import { STREAMING_SERVER_CLIENT } from 'src/domain/streamer/client/streaming-server.client';
import { StreamingServerCoreClient } from 'src/infrastructure/client/streaming-server.core-client';
import { RecordingService } from 'src/domain/recording/recording.service';
import { RECORDING_REPOSITORY } from 'src/domain/recording/recording.repository';
import { RecordingCoreRepository } from 'src/infrastructure/recording/recording.core-repository';
import { RECORDING_WORKER_CLIENT } from 'src/domain/recording/client/recording-worker.client';
import { RecordingWorkerCoreClient } from 'src/infrastructure/worker/recording-worker.core-client';

@Module({
  controllers: [MonitoringController],
  providers: [
    MonitoringUseCase,
    StreamerService,
    RecordingService,
    {
      provide: STREAMER_REPOSITORY,
      useClass: StreamerCoreRepository,
    },
    {
      provide: RECORDING_REPOSITORY,
      useClass: RecordingCoreRepository,
    },
    {
      provide: STREAMING_SERVER_CLIENT,
      useClass: StreamingServerCoreClient,
    },

    {
      provide: RECORDING_WORKER_CLIENT,
      useClass: RecordingWorkerCoreClient,
    },
  ],
  exports: [MonitoringUseCase],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpWhitelistMiddleware).forRoutes(MonitoringController);
  }
}
