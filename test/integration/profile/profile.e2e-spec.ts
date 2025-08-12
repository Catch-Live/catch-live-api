import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProfileModule } from 'src/interfaces/controller/profile/profile.module';
import { $Enums } from '@prisma/client';
import { AuthModule } from 'src/interfaces/controller/auth/auth.module';
import { JwtUtil } from 'src/support/jwt.util';
import { resetDatabase } from 'test/utils/reset-db';
import { App } from 'supertest/types';
import { createUser } from 'src/support/db-factory.util';

const testUser = {
  email: 'young@google.com',
  provider: 'GOOGLE',
};

describe('ProfileController', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let jwtUtil: JwtUtil;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProfileModule, AuthModule],
    }).compile();

    jwtUtil = module.get<JwtUtil>(JwtUtil);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  beforeEach(async () => {
    await resetDatabase();
    const user = await createUser({ email: 'young@google.com', provider: 'GOOGLE' });

    accessToken = jwtUtil.generateAccessToken({
      userId: Number(user.user_id),
      provider: user.provider!,
    });
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('JWT 인증 후 db에 담긴 값이 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(Object.values($Enums.Provider).includes(res.body.data.provider)).toBe(true);
    expect(res.body.data).toHaveProperty('email', testUser.email);
  });

  afterAll(async () => {
    await app.close();
  });
});
