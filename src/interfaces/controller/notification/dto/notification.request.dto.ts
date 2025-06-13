import { NOTIFICATION_MAX_SIZE } from 'src/support/constants';

export class NotificationsRequestDto {
  readonly userId: number;
  readonly size: number;
  readonly cursor?: number;

  constructor(userId: any, size: any, cursor?: any) {
    const convertedUserId = Number(userId);

    if (isNaN(Number(convertedUserId)) || convertedUserId <= 0) {
      this.userId = 0;
    } else {
      this.userId = convertedUserId;
    }

    const convertedSize = Number(size);

    if (isNaN(Number(convertedSize))) {
      this.size = 1;
    } else if (convertedSize <= 0 || convertedSize > NOTIFICATION_MAX_SIZE) {
      this.size = Number(NOTIFICATION_MAX_SIZE);
    } else {
      this.size = convertedSize;
    }

    if (cursor !== undefined) {
      const convertedcursor = Number(cursor);
      if (isNaN(Number(convertedcursor))) {
        this.cursor = 0;
      } else {
        this.cursor = convertedcursor;
      }
    }
  }
}
