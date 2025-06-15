import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { ResultResponseDto } from 'src/interfaces/controller/common/dto/result.response.dto';
import { GetSubscriptionsResponseDto } from 'src/interfaces/controller/subscription/dto/subscription.response.dto';
import { SubscriptionController } from 'src/interfaces/controller/subscription/subscription.controller';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  const mockedUseCase = {
    getSubscriptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionUseCase,
          useValue: mockedUseCase,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  describe('getSubscriptions', () => {
    it('구독 목록(subscriptions)을 반환해야 한다. - 성공', async () => {
      // given
      const userId = 1;
      const mockedSubscriptions = [
        new SubscriptionWithChannelResult(1, new Date(), {
          channelId: '123',
          channelName: 'test-channel-name',
          platform: 'CHZZK',
        }),
      ];

      mockedUseCase.getSubscriptions.mockResolvedValue(mockedSubscriptions);

      // when
      const result = await controller.getSubscriptions(userId);

      // then
      expect(mockedUseCase.getSubscriptions).toHaveBeenCalled();
      expect(result).toEqual(
        ResultResponseDto.success(new GetSubscriptionsResponseDto(mockedSubscriptions))
      );
    });

    it('usecase에서 에러 발생 시 예외가 반환되어야 한다. - 실패', async () => {
      // given
      const userId = 1;
      const errorMessage = 'UseCase Error';

      mockedUseCase.getSubscriptions.mockRejectedValue(new Error(errorMessage));

      // when & then
      await expect(controller.getSubscriptions(userId)).rejects.toThrow(errorMessage);
      expect(mockedUseCase.getSubscriptions).toHaveBeenCalled();
    });
  });
});
