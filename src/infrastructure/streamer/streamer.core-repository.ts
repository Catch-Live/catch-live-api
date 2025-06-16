import { Injectable } from '@nestjs/common';
import { StreamerRepository } from 'src/domain/streamer/streamer.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { LiveSessionCommand } from 'src/domain/streamer/command/streamer.command';
import { StreamerEntity } from 'src/domain/streamer/streamer.entity';

@Injectable()
export class StreamerCoreRepository implements StreamerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStreamerByChannelId(channelId: string): Promise<StreamerEntity | null> {
    const streamer = await this.prisma.streamer.findUnique({
      where: { channel_id: channelId },
    });

    if (!streamer) {
      return null;
    }

    return new StreamerEntity(
      Number(streamer.streamer_id),
      streamer.platform,
      streamer.channel_id,
      streamer.channel_name,
      false,
      streamer.created_at,
      streamer.updated_at
    );
  }

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

  async startLiveSession(query: LiveSessionCommand): Promise<void> {
    const { streamerId, isLive } = query;
    await this.prisma.streamer.update({
      where: { streamer_id: streamerId },
      data: {
        is_live: isLive,
      },
    });
  }

  async endLiveSession(query: LiveSessionCommand): Promise<void> {
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
