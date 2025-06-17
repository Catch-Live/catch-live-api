import { NotificationResponseEntity } from './entity/notification.entity';
import {
  CreateNotificationsCommand,
  NotificationRequestCommand,
} from 'src/domain/notification/command/notification.command';

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository');

export interface NotificationRepository {
  findMany(args: NotificationRequestCommand): Promise<NotificationResponseEntity[]>;
  createNotifications(command: CreateNotificationsCommand): Promise<void>;
}
