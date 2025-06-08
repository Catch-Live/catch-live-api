import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { SignoutModule } from 'src/interfaces/signout/signout.module';

describe('SignoutController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SignoutModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('db에서 응답이 오는지 확인', async () => {
    const res = await request(app.getHttpServer()).delete('/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '200');
    expect(res.body).toHaveProperty('message', 'OK');
  });

  it('삭제된 유저를 삭제하려하면 500리턴', async () => {
    const res = await request(app.getHttpServer()).delete('/users/me');
    expect(res.status).toBe(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
