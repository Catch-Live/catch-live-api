export interface RecordPayload {
  streamUrl: string;
  liveSessionId: number;
  title: string;
}

export interface RecordMessage {
  type: 'record' | 'heartbeat';
  payload: 'ping' | 'pong' | RecordPayload;
}
