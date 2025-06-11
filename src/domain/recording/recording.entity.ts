export class RecordingEntity {
  constructor(
    public readonly liveSessionId: number,
    public readonly videoUrl: string,
    public readonly startedAt: Date,
    public readonly completedAt: Date | null,
    public readonly status: RecordingStatus,
    public readonly recordingId?: number
  ) {}
}

export const RecordingStatus = {
  RECORDING: 'RECORDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type RecordingStatus = (typeof RecordingStatus)[keyof typeof RecordingStatus];
