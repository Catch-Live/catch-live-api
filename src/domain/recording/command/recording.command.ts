import { Platform } from 'src/domain/streamer/streamer.entity';
import { RecordingStatus } from '../recording.entity';

export interface GetRecordingsCommand {
  q?: string;
  recordingStatuses?: RecordingStatus[];
  platforms?: Platform[];
  sortBy: 'started_at' | 'title';
  order: 0 | 1;
  cursor?: string;
  size: number;
  userId: number;
}

export interface RecordLiveStreamingCommand {
  platform: Platform;
  channelId: string;
  channelName: string;
  liveSessionId: number;
  streamerId: number;
  title: string;
  videoId?: string;
  subscriptions: {
    userId: number;
  }[];
}
