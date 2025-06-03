import { Inject, Injectable } from '@nestjs/common';
import { RECORDING_REPOSITORY, RecordingRepository } from './recording.repository';
import { GetRecordingsCommand } from './command/recording.command';
import { RecordingWithChannelResult } from './result/recording-with-channel.result';

@Injectable()
export class RecordingService {
  constructor(
    @Inject(RECORDING_REPOSITORY)
    private readonly recordingRepository: RecordingRepository
  ) {}

  getRecordings(
    command: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }> {
    const result = this.recordingRepository.getRecordings(command);
    return result;
  }
}
