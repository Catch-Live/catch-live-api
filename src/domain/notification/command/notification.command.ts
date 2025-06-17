export class NotificationRequestCommand {
  readonly userId: number = 0;
  readonly size: number = 0;
  readonly cursor?: number;

  constructor({ userId, size, cursor }: { userId: number; size: number; cursor?: number }) {
    this.userId = userId;
    this.size = size;
    this.cursor = cursor;
  }
}

export interface CreateNotificationsCommand {
  content: string;
  subscriptions: {
    userId: number;
  }[];
}
