import { Injectable } from '@nestjs/common';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RecordingService } from 'src/domain/recording/recording.service';
import { RecordingWithChannelResult } from 'src/domain/recording/result/recording-with-channel.result';

@Injectable()
export class RecordingUseCase {
  constructor(private readonly recordingService: RecordingService) {}

  /**
   * 녹화 목록을 조회하는 유즈케이스를 실행한다.
   */
  getRecordings(
    command: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }> {
    return this.recordingService.getRecordings(command);
  }
}
