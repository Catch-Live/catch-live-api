import { Platform } from 'src/domain/streamer/streamer.entity';
import { RecordingStatus } from '../recording.entity';
import { LiveSessionStatus } from '../live-session.entity';

export interface RecordingWithChannelResult {
  liveSessionId: number;
  recordingId: number;
  title: string;
  platform: Platform;
  liveStatus: LiveSessionStatus;
  videoUrl: string;
  startedAt: Date | null;
  completedAt: Date | null;
  recordingStatus: RecordingStatus;
  channelId: string;
  channelName: string;
}
