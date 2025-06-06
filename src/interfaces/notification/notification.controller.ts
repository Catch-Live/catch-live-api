import { Controller, Get } from '@nestjs/common';

@Controller('notifications')
export class NotificationController {
  @Get('')
  getNotification() {
    return {
      code: '200',
      message: 'OK',
      data: {
        notifications: [
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
          {
            notificationId: 1457,
            content: "스트리머 '경제왕07'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1458,
            content: "스트리머 '경제왕08'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1459,
            content: "스트리머 '경제왕09'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1460,
            content: "스트리머 '경제왕10'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1461,
            content: "스트리머 '경제왕11'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1462,
            content: "스트리머 '경제왕12'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1463,
            content: "스트리머 '경제왕13'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1464,
            content: "스트리머 '경제왕14'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1465,
            content: "스트리머 '경제왕15'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
          {
            notificationId: 1466,
            content: "스트리머 '경제왕16'님의 라이브 녹화가 시작되었습니다.",
            createdAt: '2025-03-21T10:10:10',
          },
        ],
      },
    };
  }
}
