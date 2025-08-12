import { Platform } from '../streamer/streamer.entity';

export class LiveSessionEntity {
  constructor(
    public readonly streamerId: number,
    public readonly platform: Platform,
    public readonly channelId: string,
    public readonly channelName: string,
    public readonly status: LiveSessionStatus,
    public readonly liveSessionId?: number,
    public readonly title?: string,
    public readonly startedAt?: Date,
    public readonly endedAt?: Date | null
  ) {}
}

export type LiveSessionStatus = 'LIVE' | 'COMPLETED' | 'FAILED';
