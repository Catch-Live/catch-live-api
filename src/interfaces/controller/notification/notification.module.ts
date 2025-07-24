import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';
import { NotificationService } from 'src/domain/notification/notification.service';
import { NotificationCoreRepository } from 'src/infrastructure/notification/notification.core-repository';
import { NOTIFICATION_REPOSITORY } from 'src/domain/notification/notification.repository';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationUseCase,
    NotificationService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationCoreRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY, NotificationService],
})
export class NotificationModule {}
