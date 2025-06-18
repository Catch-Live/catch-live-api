import { Controller, Get, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { GetRecordingsRequestDto } from './dto/recording.request.dto';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { GetRecordingsResponseDto } from './dto/recording.response.dto';
import { Response } from 'express';
import { UserId } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingUseCase: RecordingUseCase) {}

  @Get()
  async getRecordings(
    @Query() request: GetRecordingsRequestDto,
    @UserId() userId: number,
    @Res() response: Response
  ): Promise<Response<ResultResponseDto<any>>> {
    const command = request.toCommand(userId);
    const { data, nextCursor } = await this.recordingUseCase.getRecordings(command);
    const responseDto = GetRecordingsResponseDto.of(data, nextCursor);

    return response.status(HttpStatus.OK).json(ResultResponseDto.success(responseDto));
  }
}
