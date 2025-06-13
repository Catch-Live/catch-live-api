import { NotificationResponseEntity } from './entity/notification.response.entity';
import { NotificationsRequestDto } from 'src/interfaces/controller/notification/dto/notification.request.dto';

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository');

export interface NotificationRepository {
  findMany(args: NotificationsRequestDto): Promise<NotificationResponseEntity[]>;
}
