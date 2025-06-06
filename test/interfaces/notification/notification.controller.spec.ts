import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from 'src/interfaces/notification/notification.controller';
import { NotificationUseCase } from 'src/application/notification/notification.use-case';

const testData = [
  {
    notificationId: 1455,
    content: "스트리머 '경제왕05'님의 라이브 녹화가 시작되었습니다.",
    createdAt: '2025-03-21T10:10:10',
  },
  {
    notificationId: 1456,
    content: "스트리머 '경제왕06'님의 라이브 녹화가 시작되었습니다.",
    createdAt: '2025-03-21T10:10:10',
  },
];

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationUseCase,
          useValue: {
            getNotification: jest.fn().mockReturnValue(testData),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('응답이 기대하던 형태로 전송되는지 확인', () => {
    const response = controller.getNotification();
    expect(response).toHaveProperty('code', '200');
    expect(response).toHaveProperty('message', 'OK');
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('notifications');
    expect(response.data.notifications).toEqual(testData);
  });
});
