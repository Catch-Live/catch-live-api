export class LiveSessionEntity {
  constructor(
    public readonly liveSessionId: number,
    public readonly streamerId: number,
    public readonly platform: Platform,
    public readonly channelId: string,
    public readonly channelName: string,
    public readonly title: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null,
    public readonly status: LiveSessionStatus
  ) {}
}

export type LiveSessionStatus = 'LIVE' | 'COMPLETED' | 'FAILED';
export type Platform = 'CHZZK' | 'YOUTUBE';
