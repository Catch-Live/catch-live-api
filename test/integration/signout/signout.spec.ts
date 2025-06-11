import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { UserModule } from 'src/interfaces/controller/user/user.module';
import * as jwt from 'jsonwebtoken';
import { AuthModule } from 'src/interfaces/controller/auth/auth.module';

const testUser = {
  userId: 3,
  email: 'young@google.com',
  provider: 'GOOGLE',
};

describe('SignoutController', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    accessToken = jwt.sign({ sub: testUser }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: '1h',
    });
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).delete('/users/me');
    expect(res.status).toBe(401);
  });

  it('db에서 응답이 오는지 확인', async () => {
    const res = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
  });

  it('삭제된 유저를 삭제하려하면 500리턴', async () => {
    const res = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
