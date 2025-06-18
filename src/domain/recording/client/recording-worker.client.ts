export const RECORDING_WORKER_CLIENT = Symbol('RecordingWorkerClient');

export interface RecordingWorkerClient {
  sendRecordJob(
    streamUrl: string,
    liveSessionId: number,
    title: string,
    streamerId: number,
    channelName: string,
    subscriptions: {
      userId: number;
    }[]
  ): Promise<void>;
}
