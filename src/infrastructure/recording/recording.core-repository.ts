import { RecordingRepository } from 'src/domain/recording/recording.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RecordingWithChannelResult } from 'src/domain/recording/result/recording-with-channel.result';
import { Prisma } from '@prisma/client';
import { LiveSessionEntity } from 'src/domain/recording/live-session.entity';
import { RecordingEntity } from 'src/domain/recording/recording.entity';
import { CreateLiveSessionCommand } from 'src/domain/recording/command/live-session.command';

@Injectable()
export class RecordingCoreRepository implements RecordingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRecordings(
    query: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }> {
    const { q, recordingStatuses, platforms, sortBy, order, cursor, size, userId } = query;
    const sortOrder = order === 1 ? 'asc' : 'desc';
    const where: Prisma.VSubscribedSessionWhereInput = {
      ...(q && {
        OR: [{ title: { contains: q } }, { channel_name: { contains: q } }],
      }),
      ...(recordingStatuses && {
        recording_status: { in: recordingStatuses },
      }),
      ...(platforms && {
        platform: { in: platforms },
      }),
      user_id: userId,
    };

    const queryResult = await this.prisma.vSubscribedSession.findMany({
      where,
      take: size + 1,
      orderBy: {
        [sortBy]: sortOrder,
      },
      ...(cursor && {
        cursor: {
          live_session_id: BigInt(cursor),
        },
      }),
    });

    const nextItem = queryResult.length > size ? queryResult.pop() : null;
    const nextCursor = nextItem ? nextItem.live_session_id.toString() : null;
    const data = queryResult.map((record) => {
      return {
        liveSessionId: Number(record.live_session_id),
        title: record.title,
        platform: record.platform ?? 'CHZZK',
        liveStatus: record.live_status ?? 'LIVE',
        videoUrl: record.video_url ?? '',
        startedAt: record.started_at ?? null,
        completedAt: record.completed_at ?? null,
        recordingStatus: record.recording_status ?? 'RECORDING',
        channelId: record.channel_id ?? '',
        channelName: record.channel_name ?? '',
        recordingId: Number(record.recording_id),
      };
    });

    return { data, nextCursor };
  }

  async createRecording(entity: RecordingEntity): Promise<RecordingEntity> {
    const queryResult = await this.prisma.recording.create({
      data: {
        live_session_id: entity.liveSessionId,
        video_url: entity.videoUrl,
        started_at: entity.startedAt,
        completed_at: undefined,
        status: entity.status,
      },
    });

    return new RecordingEntity(
      Number(queryResult.live_session_id),
      queryResult.video_url ?? '',
      queryResult.started_at,
      queryResult.completed_at,
      queryResult.status ?? 'RECORDING',
      Number(queryResult.recording_id)
    );
  }

  async createLiveSession(query: CreateLiveSessionCommand): Promise<LiveSessionEntity> {
    const { streamerId, platform, channelId, channelName, title, status } = query;
    const queryResult = await this.prisma.liveSession.create({
      data: {
        streamer_id: streamerId,
        platform: platform,
        channel_id: channelId,
        channel_name: channelName,
        title: title ?? '',
        status: status,
      },
    });

    return new LiveSessionEntity(
      Number(queryResult.streamer_id),
      queryResult.platform ?? 'CHZZK',
      queryResult.channel_id ?? '',
      queryResult.channel_name ?? '',
      queryResult.status ?? 'LIVE',
      Number(queryResult.live_session_id),
      queryResult.title,
      queryResult.started_at,
      queryResult.ended_at
    );
  }

  async completeLiveSession(livesSessionId: number): Promise<void> {
    await this.prisma.liveSession.update({
      where: { live_session_id: livesSessionId },
      data: {
        status: 'COMPLETED',
        ended_at: new Date(),
      },
    });
  }

  async failLiveSession(livesSessionId: number): Promise<void> {
    await this.prisma.liveSession.update({
      where: { live_session_id: livesSessionId },
      data: {
        status: 'FAILED',
        ended_at: new Date(),
      },
    });
  }
}
