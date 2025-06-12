import { Injectable } from '@nestjs/common';
import { StreamerRepository } from 'src/domain/streamer/streamer.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { StartLiveSessionCommand } from 'src/domain/streamer/command/streamer.command';

@Injectable()
export class StreamerCoreRepository implements StreamerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStreamers(): Promise<StreamerWithChannelResult[]> {
    const queryResult = await this.prisma.streamer.findMany({
      where: {
        is_live: false,
        subscriptions: {
          some: {
            is_connected: true,
          },
        },
      },
      select: {
        streamer_id: true,
        platform: true,
        channel_id: true,
        channel_name: true,
        video_id: true,
        created_at: true,
      },
    });

    return queryResult.map((streamer) => ({
      streamerId: Number(streamer.streamer_id),
      channel: {
        channelId: streamer.channel_id,
        channelName: streamer.channel_name,
        platform: streamer.platform,
        videoId: streamer.video_id,
      },
      createdAt: streamer.created_at,
    }));
  }

  async startLiveSession(query: StartLiveSessionCommand): Promise<void> {
    const { streamerId, isLive } = query;
    await this.prisma.streamer.update({
      where: { streamer_id: streamerId },
      data: {
        is_live: isLive,
      },
    });
  }

  async clearVideoInfo(streamerId: number): Promise<void> {
    await this.prisma.streamer.update({
      where: { streamer_id: streamerId },
      data: { video_id: '' },
    });
  }
}
