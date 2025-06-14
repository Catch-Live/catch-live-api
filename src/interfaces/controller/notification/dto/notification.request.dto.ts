import { Request } from 'express';
import { NOTIFICATION_MAX_SIZE } from 'src/support/constants';

export class NotificationsRequestDto {
  readonly userId: number = 0;
  readonly size: number = 0;
  readonly cursor?: number = 0;

  constructor(req: Request) {
    if (req.user !== undefined && req.user['userId'] !== undefined) {
      const convertedUserId = Number(req.user['userId']);
      if (!isNaN(convertedUserId) && convertedUserId > 0) {
        this.userId = convertedUserId;
      }
    }

    if (req.query.size !== undefined) {
      const convertedSize = Number(req.query.size);
      if (!isNaN(convertedSize) && convertedSize > 0 && convertedSize <= NOTIFICATION_MAX_SIZE) {
        this.size = convertedSize;
      }
    }

    if (req.query.cursor !== undefined) {
      const convertedCursor = Number(req.query.cursor);
      if (!isNaN(convertedCursor) && convertedCursor > 0) {
        this.cursor = convertedCursor;
      }
    }
  }
}
