import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';

@Module({
  controllers: [NotificationController],
  providers: [NotificationUseCase],
})
export class NotificationModule {}
