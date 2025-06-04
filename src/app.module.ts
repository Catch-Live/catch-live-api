import { Module } from '@nestjs/common';
import { RecordingModule } from './interfaces/recording/recording.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [RecordingModule, PrismaModule],
})

// 루트 모듈이자, DI 컨테이너의 진입점
export class AppModule {}
