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

export const RecordingStatus = {
  RECORDING: 'RECORDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type RecordingStatus = (typeof RecordingStatus)[keyof typeof RecordingStatus];
