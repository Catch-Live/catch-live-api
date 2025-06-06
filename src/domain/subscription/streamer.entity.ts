export class StreamerEntity {
  constructor(
    public readonly streamerId: number,
    public readonly platform: Platform,
    public readonly channelId: string,
    public readonly channelName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export type Platform = 'CHZZK' | 'YOUTUBE';
