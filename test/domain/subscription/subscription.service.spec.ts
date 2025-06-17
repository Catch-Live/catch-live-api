import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_SERVICE } from 'src/domain/common/cache/cache.service';
import { STREAMING_SERVER_CLIENT } from 'src/domain/streamer/client/streaming-server.client';
import { STREAMER_REPOSITORY } from 'src/domain/streamer/streamer.repository';
import { SubscriptionWithChannelResult } from 'src/domain/subscription/result/subscription-with-channel.result';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/subscription/subscription.repository';
import { SubscriptionService } from 'src/domain/subscription/subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockedSubscriptionRepository = {
    getSubscriptions: jest.fn(),
  };
  const mockedStreamerRepository = {};
  const mockedStreamingServerClient = {};
  const mockedCacheServerClient = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: mockedSubscriptionRepository,
        },
        {
          provide: STREAMER_REPOSITORY,
          useValue: mockedStreamerRepository,
        },
        {
          provide: STREAMING_SERVER_CLIENT,
          useValue: mockedStreamingServerClient,
        },
        {
          provide: CACHE_SERVICE,
          useValue: mockedCacheServerClient,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
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

      mockedSubscriptionRepository.getSubscriptions.mockResolvedValue(mockedSubscriptions);

      // when
      const result = await service.getSubscriptions(userId);

      // then
      expect(mockedSubscriptionRepository.getSubscriptions).toHaveBeenCalled();
      expect(result).toEqual(mockedSubscriptions);
    });

    it('repository에서 에러 발생 시 예외를 반환해야 한다. - 실패', async () => {
      // given
      const userId = 1;
      const errorMessage = 'DB Error';

      mockedSubscriptionRepository.getSubscriptions.mockRejectedValue(new Error(errorMessage));

      // when & then
      await expect(service.getSubscriptions(userId)).rejects.toThrow(errorMessage);
      expect(mockedSubscriptionRepository.getSubscriptions).toHaveBeenCalled();
    });
  });
});
