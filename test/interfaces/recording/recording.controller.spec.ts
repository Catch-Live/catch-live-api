import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { GetRecordingsRequestDto } from 'src/interfaces/controller/recording/dto/recording.request.dto';
import { RecordingController } from 'src/interfaces/controller/recording/recording.controller';

describe('RecordingController', () => {
  let controller: RecordingController;
  let mockUseCase: { getRecordings: jest.Mock };

  beforeEach(async () => {
    mockUseCase = {
      getRecordings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordingController],
      providers: [
        {
          provide: RecordingUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<RecordingController>(RecordingController);
  });

  describe('getRecordings', () => {
    it('recordings와 nextCursor를 반환해야 한다. - 성공', async () => {
      // given
      const requestDto = plainToInstance(GetRecordingsRequestDto, {
        sortBy: 'started_at',
        order: 0,
        size: 10,
      });

      const command = {
        sortBy: 'started_at',
        order: 0,
        size: 10,
      };

      requestDto.toCommand = jest.fn().mockReturnValue(command);

      const mockResult = {
        data: [{ recordingId: 1, title: '테스트' }],
        nextCursor: '5',
      };

      mockUseCase.getRecordings.mockResolvedValue(mockResult);

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

      const mockResponse = {
        status: mockStatus,
      } as unknown as Response;

      // when
      await controller.getRecordings(requestDto, mockResponse);

      // then
      expect(mockUseCase.getRecordings).toHaveBeenCalledWith(command);
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(
        ResultResponseDto.success({
          recordings: mockResult.data,
          nextCursor: mockResult.nextCursor,
        })
      );
    });

    it('usecase에서 에러가 발생하면 예외가 전달되어야 한다. - 실패', async () => {
      // given
      const requestDto = plainToInstance(GetRecordingsRequestDto, {
        sortBy: 'started_at',
        order: 0,
        size: 10,
      });

      const command = {
        sortBy: 'started_at',
        order: 0,
        size: 10,
      };

      requestDto.toCommand = jest.fn().mockReturnValue(command);

      const mockError = new Error('유스케이스 처리 중 에러');
      mockUseCase.getRecordings.mockRejectedValue(mockError);

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

      const mockResponse = {
        status: mockStatus,
      } as unknown as Response;

      // when & then
      await expect(controller.getRecordings(requestDto, mockResponse)).rejects.toThrow(
        '유스케이스 처리 중 에러'
      );

      expect(mockUseCase.getRecordings).toHaveBeenCalledWith(command);
    });
  });
});
