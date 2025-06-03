import { RecordingWithChannelResult } from 'src/domain/recording/result/recording-with-channel.result';

export class GetRecordingsResponseDto {
  constructor(
    private readonly recordings: RecordingWithChannelResult[],
    private readonly nextCursor: string | null
  ) {}

  static of(
    recordings: RecordingWithChannelResult[],
    nextCursor: string | null
  ): GetRecordingsResponseDto {
    return new GetRecordingsResponseDto(recordings, nextCursor);
  }

  toJSON() {
    return {
      recordings: this.recordings.map((r) => ({
        liveSessionId: r.liveSessionId,
        title: r.title,
        platform: r.platform,
        videoUrl: r.videoUrl,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
        status: r.status,
        channel: {
          channelId: r.channelId,
          channelName: r.channelName,
        },
      })),
      nextCursor: this.nextCursor,
    };
  }
}
