import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProfileModule } from 'src/interfaces/profile/profile.module';
import { ValidationPipe } from '@nestjs/common';
import { $Enums } from '@prisma/client';

describe('ProfileController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProfileModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('db에 담긴 값이 오는지 확인', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '200');
    expect(res.body).toHaveProperty('message', 'OK');
    expect(res.body).toHaveProperty('data');
    expect(Object.values($Enums.Provider).includes(res.body.data.provider)).toBe(true);
    expect(res.body.data).toHaveProperty('email', 'kakao@kakao.com');
  });

  afterAll(async () => {
    await app.close();
  });
});
