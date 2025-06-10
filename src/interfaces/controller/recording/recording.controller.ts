import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { GetRecordingsRequestDto } from './dto/recording.request.dto';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { GetRecordingsResponseDto } from './dto/recording.response.dto';
import { Response } from 'express';

@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingUseCase: RecordingUseCase) {}

  @Get()
  async getRecordings(
    @Query() request: GetRecordingsRequestDto,
    @Res() response: Response
  ): Promise<Response<ResultResponseDto<any>>> {
    const command = request.toCommand();
    const { data, nextCursor } = await this.recordingUseCase.getRecordings(command);
    const responseDto = GetRecordingsResponseDto.of(data, nextCursor);

    return response.status(HttpStatus.OK).json(ResultResponseDto.success(responseDto));
  }
}
