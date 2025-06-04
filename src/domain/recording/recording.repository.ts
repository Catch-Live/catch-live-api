import { GetRecordingsCommand } from './command/recording.command';
import { RecordingWithChannelResult } from './result/recording-with-channel.result';

export const RECORDING_REPOSITORY = Symbol('RecordingRepository');

export interface RecordingRepository {
  getRecordings(
    query: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }>;
}
