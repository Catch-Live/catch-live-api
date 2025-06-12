import { CreateLiveSessionCommand } from './command/live-session.command';
import { GetRecordingsCommand } from './command/recording.command';
import { LiveSessionEntity } from './live-session.entity';
import { RecordingEntity } from './recording.entity';
import { RecordingWithChannelResult } from './result/recording-with-channel.result';

export const RECORDING_REPOSITORY = Symbol('RecordingRepository');

export interface RecordingRepository {
  getRecordings(
    query: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }>;
  createRecording(entity: RecordingEntity): Promise<RecordingEntity>;
  createLiveSession(query: CreateLiveSessionCommand): Promise<LiveSessionEntity>;
  completeLiveSession(livesSessionId: number): Promise<void>;
}
