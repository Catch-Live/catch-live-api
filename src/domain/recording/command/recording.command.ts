import { Platform } from 'src/domain/subscription/streamer.entity';
import { RecordingStatus } from '../recording.entity';

export class GetRecordingsCommand {
  constructor(
    public readonly q?: string,
    public readonly recordingStatuses?: RecordingStatus[],
    public readonly platforms?: Platform[],
    public readonly sortBy: 'started_at' | 'title' = 'started_at',
    public readonly order: 0 | 1 = 0,
    public readonly cursor?: string,
    public readonly size: number = 10
  ) {}
}
