import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AuthModule } from 'src/interfaces/controller/auth/auth.module';

const testUser = {
  userId: 3,
  provider: 'GOOGLE',
};

describe('LogoutController', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    accessToken = jwt.sign({ ...testUser }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: '1h',
    });
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).post('/auth/logout');
    expect(res.status).toBe(401);
  });

  it('db에서 응답이 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
  });

  afterAll(async () => {
    await app.close();
  });
});
