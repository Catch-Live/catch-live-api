import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProfileModule } from 'src/interfaces/profile/profile.module';
import { $Enums } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { AuthModule } from 'src/interfaces/auth/auth.module';

describe('ProfileController', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProfileModule, AuthModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    accessToken = jwt.sign(
      {
        sub: {
          userId: 1,
          email: 'kakao@kakao.com',
          provider: 'KAKAO',
        },
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: '1h' }
    );
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');
    console.log(res.body);
    expect(res.status).toBe(401);
  });

  it('JWT 인증 후 db에 담긴 값이 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    console.log(res.body);
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
