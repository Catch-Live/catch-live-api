import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RecordingStatus } from 'src/domain/recording/recording.entity';
import { Platform } from 'src/domain/streamer/streamer.entity';

export class GetRecordingsRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value) as string[])
  @IsIn([...Object.values(RecordingStatus)], { each: true })
  recordingStatuses?: RecordingStatus[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value) as string[])
  @IsIn([...Object.values(Platform)], { each: true })
  platforms?: Platform[];

  @IsOptional()
  @IsString()
  @IsIn(['started_at', 'title'])
  sortBy?: 'started_at' | 'title' = 'started_at';

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  order?: 0 | 1 = 0;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 10;

  toCommand(): GetRecordingsCommand {
    return {
      q: this.q,
      recordingStatuses: this.recordingStatuses,
      platforms: this.platforms,
      sortBy: this.sortBy ?? 'started_at',
      order: this.order ?? 0,
      cursor: this.cursor,
      size: this.size ?? 10,
    };
  }
}
