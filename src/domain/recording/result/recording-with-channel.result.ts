import { RecordingStatus } from '../recording.entity';
import { Platform } from '../live-session.entity';

export class RecordingWithChannelResult {
  constructor(
    public readonly liveSessionId: number,
    public readonly title: string,
    public readonly platform: Platform,
    public readonly videoUrl: string,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly status: RecordingStatus | 'RECORDING',
    public readonly channelId: string,
    public readonly channelName: string
  ) {}
}
