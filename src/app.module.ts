import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';
import { ProfileModule } from './interfaces/profile/profile.module';

@Module({
  imports: [RecordingModule, SubscriptionModule, ProfileModule, PrismaModule],
})

// 루트 모듈이자, DI 컨테이너의 진입점
export class AppModule {}
