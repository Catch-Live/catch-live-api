import { Platform } from 'src/domain/streamer/streamer.entity';
import { RecordingStatus } from '../recording.entity';
import { LiveStatus } from '@prisma/client';

export interface RecordingWithChannelResult {
  liveSessionId: number;
  title: string;
  platform: Platform;
  liveStatus: LiveStatus;
  videoUrl: string;
  startedAt: Date | null;
  completedAt: Date | null;
  recordingStatus: RecordingStatus;
  channelId: string;
  channelName: string;
}
