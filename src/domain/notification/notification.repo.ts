import { NotificationResponseResult } from './result/notification.response.result';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository');

export interface NotificationRepository {
  findMany(args: NotificationsRequestDto): Promise<NotificationResponseResult[]>;
}
