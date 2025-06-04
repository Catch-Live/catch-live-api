import { Module } from '@nestjs/common';
import { RecordingController } from './recording.controller';
import { RecordingService } from 'src/domain/recording/recording.service';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { RECORDING_REPOSITORY } from 'src/domain/recording/recording.repository';
import { RecordingCoreRepository } from 'src/infrastructure/recording/recording.core-repository';

@Module({
  controllers: [RecordingController],
  providers: [
    RecordingService,
    RecordingUseCase,
    {
      provide: RECORDING_REPOSITORY,
      useClass: RecordingCoreRepository, // insert from Nest Container
    },
  ],
})
export class RecordingModule {}
