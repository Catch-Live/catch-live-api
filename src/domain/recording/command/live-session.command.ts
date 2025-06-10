import { Platform } from 'generated/prisma';
import { LiveSessionStatus } from '../live-session.entity';

export interface CreateLiveSessionCommand {
  streamerId: number;
  platform: Platform;
  channelId?: string;
  channelName: string;
  status: LiveSessionStatus;
  liveSessionId?: number;
  title?: string;
}
