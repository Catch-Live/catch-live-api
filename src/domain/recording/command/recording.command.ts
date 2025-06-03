import { RecordingStatus } from '../recording.entity';

export class GetRecordingsCommand {
  constructor(
    public readonly q?: string,
    public readonly filter?: RecordingStatus,
    public readonly sortBy: 'started_at' | 'title' = 'started_at',
    public readonly order: 0 | 1 = 0,
    public readonly cursor?: string,
    public readonly size: number = 10
  ) {}
}
