export class StreamerEntity {
  constructor(
    public readonly streamerId: number,
    public readonly platform: Platform,
    public readonly channelId: string,
    public readonly channelName: string,
    public isLive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public videoId?: string
  ) {}
}

export const Platform = {
  CHZZK: 'CHZZK',
  YOUTUBE: 'YOUTUBE',
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export type ChannelInfo = {
  channelId: string;
  channelName: string;
  platform: Platform;
};
