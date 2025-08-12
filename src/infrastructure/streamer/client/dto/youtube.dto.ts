export interface YouTubeSearchResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      channelId: string;
      title: string;
      liveBroadcastContent?: string;
    };
    liveStreamingDetails: {
      actualStartTime: string;
      scheduledStartTime: string;
    };
  }>;
}
