import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RecordingStatus } from 'src/domain/recording/recording.entity';

export class GetRecordingsRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['RECORDING', 'COMPLETED', 'FAILED'])
  filter?: RecordingStatus;

  @IsOptional()
  @IsString()
  @IsIn(['started_at', 'title'])
  sortBy: 'started_at' | 'title' = 'started_at';

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  order: 0 | 1 = 0;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 10;

  toCommand(): GetRecordingsCommand {
    return new GetRecordingsCommand(
      this.q,
      this.filter,
      this.sortBy,
      this.order,
      this.cursor,
      this.size
    );
  }
}
