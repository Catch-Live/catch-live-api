import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationModule } from 'src/interfaces/notification/notification.module';

describe('NotificationController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('응답이 기대하던 형태로 전송되는지 확인', async () => {
    const res = await request(app.getHttpServer()).get('/notifications');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '200');
    expect(res.body).toHaveProperty('message', 'OK');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
