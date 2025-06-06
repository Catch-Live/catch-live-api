import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { NotificationModule } from './interfaces/notification/notification.module';

@Module({
  imports: [RecordingModule, PrismaModule, NotificationModule],
})
export class AppModule {}
