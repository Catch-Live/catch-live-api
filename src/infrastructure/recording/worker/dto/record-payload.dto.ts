export interface RecordPayload {
  streamUrl: string;
  liveSessionId: number;
  title: string;
  streamerId: number;
  workerId?: string;
  retryCount?: number; // 기본 0
  status?: 'COMPLETED' | 'FAILED';
  channelName: string;
  subscriptions: {
    userId: number;
  }[];
}
