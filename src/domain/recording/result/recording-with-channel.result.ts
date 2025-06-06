import { Platform } from 'src/domain/subscription/streamer.entity';
import { RecordingStatus } from '../recording.entity';
import { LiveStatus } from 'generated/prisma';

export class RecordingWithChannelResult {
  constructor(
    public readonly liveSessionId: number,
    public readonly title: string,
    public readonly platform: Platform,
    public readonly liveStatus: LiveStatus,
    public readonly videoUrl: string,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly recordingStatus: RecordingStatus,
    public readonly channelId: string,
    public readonly channelName: string
  ) {}
}
