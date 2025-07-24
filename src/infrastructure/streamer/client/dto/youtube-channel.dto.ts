export interface YouTubeChannelResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      title: string;
    };
  }>;
}
