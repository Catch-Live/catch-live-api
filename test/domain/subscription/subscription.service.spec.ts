import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/subscription/subscription.repository';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockedRepository = {
    getSubscriptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: mockedRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  describe('getSubscriptions', () => {
    it('구독 목록(subscriptions)을 반환해야 한다. - 성공', async () => {
      // given
      const mockedSubscriptions = [
        new SubscriptionWithChannelResult(1, new Date(), {
          channelId: '123',
          channelName: 'test-channel-name',
          platform: 'CHZZK',
        }),
      ];

      mockedRepository.getSubscriptions.mockResolvedValue(mockedSubscriptions);

      // when
      const result = await service.getSubscriptions();

      // then
      expect(mockedRepository.getSubscriptions).toHaveBeenCalled();
      expect(result).toEqual(mockedSubscriptions);
    });

    it('repository에서 에러 발생 시 예외를 반환해야 한다. - 실패', async () => {
      // given
      const errorMessage = 'DB Error';

      mockedRepository.getSubscriptions.mockRejectedValue(new Error(errorMessage));

      // when & then
      await expect(service.getSubscriptions()).rejects.toThrow(errorMessage);
      expect(mockedRepository.getSubscriptions).toHaveBeenCalled();
    });
  });
});
