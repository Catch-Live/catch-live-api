import { Test, TestingModule } from '@nestjs/testing';
import { RecordingUseCase } from 'src/application/recording/recording.use-case';
import { ResultResponseDto } from 'src/interfaces/common/dto/result.response.dto';
import { GetRecordingsRequestDto } from 'src/interfaces/recording/dto/recording.request.dto';
import { RecordingController } from 'src/interfaces/recording/recording.controller';

describe('RecordingController', () => {
  let controller: RecordingController;

  const mockUseCase = {
    getRecordings: jest.fn(),
  };

  beforeEach(async () => {
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
      const requestDto = new GetRecordingsRequestDto();
      const command = { sortBy: 'started_at', order: 0, size: 10 } as const;
      const toCommandSpy = jest.spyOn(requestDto, 'toCommand').mockReturnValue(command);
      const mockResult = {
        data: [{ recordingId: 1, title: '테스트' }],
        nextCursor: '5',
      };

      mockUseCase.getRecordings.mockResolvedValue(mockResult);

      // when
      const result = await controller.getRecordings(requestDto);

      // then
      expect(toCommandSpy).toHaveBeenCalled();
      expect(mockUseCase.getRecordings).toHaveBeenCalledWith(command);
      expect(result).toEqual(
        ResultResponseDto.success({
          recordings: mockResult.data,
          nextCursor: mockResult.nextCursor,
        })
      );
    });

    it('usecase에서 에러가 발생하면 예외가 전달되어야 한다. - 실패', async () => {
      // given
      const requestDto = new GetRecordingsRequestDto();
      const command = { sortBy: 'started_at', order: 0, size: 10 } as const;
      jest.spyOn(requestDto, 'toCommand').mockReturnValue(command);

      const mockError = new Error('유스케이스 처리 중 에러');
      mockUseCase.getRecordings.mockRejectedValue(mockError);

      // when & then
      await expect(controller.getRecordings(requestDto)).rejects.toThrow('유스케이스 처리 중 에러');
      expect(mockUseCase.getRecordings).toHaveBeenCalledWith(command);
    });
  });
});
