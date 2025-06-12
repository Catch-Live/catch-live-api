export interface ChzzkLiveStatusResponse {
  content: {
    status: 'OPEN' | 'CLOSE';
    channelId: string;
    liveTitle: string;
  };
}
