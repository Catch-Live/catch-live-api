import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationModule } from 'src/interfaces/controller/notification/notification.module';
import { ValidationPipe } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthModule } from 'src/interfaces/controller/auth/auth.module';

const testUser = {
  userId: 3,
  email: 'young@google.com',
  provider: 'GOOGLE',
};

describe('NotificationController', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, AuthModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    accessToken = jwt.sign({ sub: testUser }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: '1h',
    });
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).get('/notifications?size=3&cursor=4');
    expect(res.status).toBe(401);
  });

  it('size전송시 데이터가 size만큼 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications?size=3')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBe(3);
    expect(res.body.data.nextCursor).toBe(11);
  });

  it('size와 cursor 전송시 cursor 부터 size 만큼 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications?size=3&cursor=4')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBeLessThanOrEqual(3);
    expect(res.body.data.notifications[0].notificationId).toBe(3);
    expect(res.body.data.nextCursor).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
