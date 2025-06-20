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
        liveStatus: r.liveStatus,
        videoUrl: r.videoUrl,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
        recordingStatus: r.recordingStatus,
        recordingId: r.recordingId,
        channel: {
          channelId: r.channelId,
          channelName: r.channelName,
          platform: r.platform,
        },
      })),
      nextCursor: this.nextCursor,
    };
  }
}
