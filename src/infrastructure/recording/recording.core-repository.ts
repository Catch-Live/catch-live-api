import { RecordingRepository } from 'src/domain/recording/recording.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RecordingWithChannelResult } from 'src/domain/recording/result/recording-with-channel.result';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordingCoreRepository implements RecordingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRecordings(
    query: GetRecordingsCommand
  ): Promise<{ data: RecordingWithChannelResult[]; nextCursor: string | null }> {
    const { q, filter, sortBy, order, cursor, size } = query;
    const sortOrder = order === 1 ? 'asc' : 'desc';
    const where: Prisma.VSubscribedSessionWhereInput = {
      ...(q && {
        OR: [{ title: { contains: q } }, { channel_name: { contains: q } }],
      }),
      ...(filter && {
        status: filter,
      }),
    };

    const recordings = await this.prismaService.vSubscribedSession.findMany({
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

    const nextItem = recordings.length > size ? recordings.pop() : null;
    const nextCursor = nextItem ? nextItem.live_session_id.toString() : null;
    const data = recordings.map((r) => this.toEntity(r));

    return { data, nextCursor };
  }

  private toEntity(
    record: Prisma.VSubscribedSessionGetPayload<Prisma.VSubscribedSessionDefaultArgs>
  ): RecordingWithChannelResult {
    return new RecordingWithChannelResult(
      Number(record.live_session_id),
      record.title,
      record.platform ?? 'CHZZK',
      record.video_url ?? '',
      record.started_at ?? null,
      record.completed_at ?? null,
      record.status ?? 'RECORDING',
      record.channel_id ?? '',
      record.channel_name ?? ''
    );
  }
}
