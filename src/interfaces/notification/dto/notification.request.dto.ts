import { NOTIFICATION_MAX_SIZE } from 'src/support/constants';

export class NotificationsRequestDto {
  readonly size: number;
  readonly cursor?: number;

  constructor(size: any, cursor?: any) {
    const convertedSize = Number(size);

    if (isNaN(Number(convertedSize))) {
      this.size = 1;
    }
    if (convertedSize <= 0 || convertedSize > NOTIFICATION_MAX_SIZE) {
      this.size = NOTIFICATION_MAX_SIZE;
    } else {
      this.size = convertedSize;
    }
    if (cursor !== undefined) {
      const convertedcursor = Number(cursor);
      if (isNaN(Number(convertedcursor))) {
        this.cursor = 0;
      }
      this.cursor = convertedcursor;
    }
  }
}
