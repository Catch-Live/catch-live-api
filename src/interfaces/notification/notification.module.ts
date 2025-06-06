import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';
import { NotificationService } from 'src/domain/notification/notification.service';
import { NotificationCoreRepository } from 'src/infrastructure/notification/notification.core-repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationUseCase, NotificationService, NotificationCoreRepository],
})
export class NotificationModule {}
