import { Test, TestingModule } from '@nestjs/testing';
import { RECORDING_WORKER_CLIENT } from 'src/domain/recording/client/recording-worker.client';
import { GetRecordingsCommand } from 'src/domain/recording/command/recording.command';
import { RECORDING_REPOSITORY } from 'src/domain/recording/recording.repository';
import { RecordingService } from 'src/domain/recording/recording.service';
import { RecordingWithChannelResult } from 'src/domain/recording/result/recording-with-channel.result';

describe('RecordingService', () => {
  let service: RecordingService;

  const mockRecordingRepository = {
    getRecordings: jest.fn(),
  };

  const mockRecordingWorkerClient = {
    run: jest.fn(),
    sendRecordJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordingService,
        {
          provide: RECORDING_REPOSITORY,
          useValue: mockRecordingRepository, // insert from mock Object
        },
        {
          provide: RECORDING_WORKER_CLIENT,
          useValue: mockRecordingWorkerClient, // insert from mock Object
        },
      ],
    }).compile();

    service = module.get<RecordingService>(RecordingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecordings', () => {
    it('recordings와 nextCursor를 반환해야 한다. - 성공', async () => {
      // given
      const command: GetRecordingsCommand = {
        q: 'q',
        recordingStatuses: undefined,
        platforms: ['CHZZK'],
        sortBy: 'started_at',
        order: 0,
        cursor: undefined,
        size: 10,
        userId: 1,
      };

      const recordingWithChannelResult: RecordingWithChannelResult = {
        liveSessionId: 1,
        recordingId: 1,
        title: 'title',
        platform: 'CHZZK',
        liveStatus: 'LIVE',
        videoUrl: 'https://video.com',
        startedAt: new Date(),
        completedAt: new Date(),
        recordingStatus: 'COMPLETED',
        channelId: '123',
        channelName: 'test channel',
      };

      const mockResult = {
        data: [recordingWithChannelResult],
        nextCursor: '12',
      };

      mockRecordingRepository.getRecordings.mockResolvedValue(mockResult);

      // when
      const result = await service.getRecordings(command);

      // then
      expect(result).toEqual(mockResult);
      expect(mockRecordingRepository.getRecordings).toHaveBeenCalledWith(command);
    });

    it('repository에서 에러가 발생하면 예외가 전달되어야 한다. - 실패', async () => {
      // given
      const command: GetRecordingsCommand = {
        q: 'q',
        recordingStatuses: undefined,
        platforms: ['CHZZK'],
        sortBy: 'started_at',
        order: 0,
        cursor: undefined,
        size: 10,
        userId: 1,
      };
      const error = new Error('DB connection failed');

      mockRecordingRepository.getRecordings.mockRejectedValue(error);

      // when & then
      await expect(service.getRecordings(command)).rejects.toThrow('DB connection failed');
      expect(mockRecordingRepository.getRecordings).toHaveBeenCalledWith(command);
    });
  });
});
