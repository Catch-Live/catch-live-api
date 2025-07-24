import { Module } from '@nestjs/common';
import { STREAMING_SERVER_CLIENT } from 'src/domain/streamer/client/streaming-server.client';
import { STREAMER_REPOSITORY } from 'src/domain/streamer/streamer.repository';
import { StreamerService } from 'src/domain/streamer/streamer.service';
import { StreamingServerCoreClient } from 'src/infrastructure/streamer/client/streaming-server.core-client';
import { StreamerCoreRepository } from 'src/infrastructure/streamer/streamer.core-repository';

@Module({
  providers: [
    StreamerService,
    {
      provide: STREAMER_REPOSITORY,
      useClass: StreamerCoreRepository,
    },
    {
      provide: STREAMING_SERVER_CLIENT,
      useClass: StreamingServerCoreClient,
    },
  ],
  exports: [STREAMER_REPOSITORY],
})
export class StreamerModule {}
