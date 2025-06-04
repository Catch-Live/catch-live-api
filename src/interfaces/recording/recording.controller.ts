import { Controller, Get, Query } from '@nestjs/common';
import { GetRecordingsRequestDto } from './dto/recording.request.dto';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { GetRecordingsResponseDto } from './dto/recording.response.dto';

@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingUseCase: RecordingUseCase) {}

  @Get()
  async getRecordings(@Query() request: GetRecordingsRequestDto): Promise<ResultResponseDto<any>> {
    const command = request.toCommand();
    const { data, nextCursor } = await this.recordingUseCase.getRecordings(command);

    const responseDto = GetRecordingsResponseDto.of(data, nextCursor);

    return ResultResponseDto.success(responseDto);
  }
}
