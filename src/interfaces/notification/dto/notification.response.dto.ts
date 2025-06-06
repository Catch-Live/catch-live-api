export class NotificationEntity {
  constructor(
    public readonly notificationId: number,
    public readonly content: string,
    public readonly createdAt: string
  ) {}
}

export class NotificationsResponseDto {
  code: string;
  message: string;
  data: { notifications: NotificationEntity[] };

  constructor(code: string, message: string, notifications: NotificationEntity[]) {
    this.code = code;
    this.message = message;
    this.data = { notifications: notifications };
  }
}
