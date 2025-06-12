import { Module } from '@nestjs/common';
import { RecordingController } from './recording.controller';
import { RecordingService } from 'src/domain/recording/recording.service';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { RECORDING_REPOSITORY } from 'src/domain/recording/recording.repository';
import { RecordingCoreRepository } from 'src/infrastructure/recording/recording.core-repository';
import { RECORDING_WORKER_CLIENT } from 'src/domain/recording/client/recording-worker.client';
import { RecordingWorkerCoreClient } from 'src/infrastructure/recording/worker/recording-worker.core-client';

@Module({
  controllers: [RecordingController],
  providers: [
    RecordingService,
    RecordingUseCase,
    {
      provide: RECORDING_REPOSITORY,
      useClass: RecordingCoreRepository,
    },
    {
      provide: RECORDING_WORKER_CLIENT,
      useClass: RecordingWorkerCoreClient,
    },
  ],
})
export class RecordingModule {}
