export class RecordingEntity {
  constructor(
    public readonly recordingId: number,
    public readonly liveSessionId: number,
    public readonly videoUrl: string,
    public readonly startedAt: Date,
    public readonly completedAt: Date | null,
    public readonly status: RecordingStatus
  ) {}
}

export type RecordingStatus = 'RECORDING' | 'COMPLETED' | 'FAILED';
