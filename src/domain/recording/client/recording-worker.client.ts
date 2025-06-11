export const RECORDING_WORKER_CLIENT = Symbol('RecordingWorkerClient');

export interface RecordingWorkerClient {
  run(): void;
  sendRecordJob(streamUrl: string, liveSessionId: number, title: string): void;
}
