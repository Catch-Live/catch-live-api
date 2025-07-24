export const RECORDING_QUEUE_CLIENT = Symbol('RecordingQueueClient');

export interface RecordingQueueClient {
  popJob(queue: string): Promise<any>;
  pushJob(queue: string, job: object): Promise<void>;
}
