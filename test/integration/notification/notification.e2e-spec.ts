import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationModule } from 'src/interfaces/controller/notification/notification.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from 'src/interfaces/controller/auth/auth.module';
import { JwtUtil } from 'src/support/jwt.util';
import { createNotification, createUser, getUser } from 'src/support/db-factory.util';
import { resetDatabase } from 'test/utils/reset-db';

describe('NotificationController', () => {
  let app: INestApplication;
  let jwtUtil: JwtUtil;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, AuthModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    jwtUtil = module.get<JwtUtil>(JwtUtil);
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('JWT 없이 요청하면 401', async () => {
    const res = await request(app.getHttpServer()).get('/notifications?size=3&cursor=4');
    expect(res.status).toBe(401);
  });

  it('size전송시 데이터가 size만큼 오는지 확인', async () => {
    // given
    await createUser({
      nickname: 'user123',
      email: 'abcd@naver.com',
      provider: 'KAKAO',
    });
    const user = await getUser({ email: 'abcd@naver.com', provider: 'KAKAO' });
    const accessToken = jwtUtil.generateAccessToken({
      userId: Number(user?.user_id),
      provider: user!.provider!,
    });

    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머1'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머2'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머3'님의 녹화가 시작되었습니다.`,
    });

    // when
    const res = await request(app.getHttpServer())
      .get('/notifications?size=3')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBe(3);
    expect(res.body.data.nextCursor).not.toBeNull();
  });

  it('cursor 가 0일때와 cursor 가 없을때의 결과는 달라야 한다.', async () => {
    // given
    await createUser({
      nickname: 'user123',
      email: 'abcd@naver.com',
      provider: 'KAKAO',
    });
    const user = await getUser({ email: 'abcd@naver.com', provider: 'KAKAO' });
    const accessToken = jwtUtil.generateAccessToken({
      userId: Number(user?.user_id),
      provider: user!.provider!,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머1'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머2'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머3'님의 녹화가 시작되었습니다.`,
    });

    // when
    const res = await request(app.getHttpServer())
      .get('/notifications?size=3&cursor=0')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBe(0);
    expect(res.body.data.nextCursor).not.toBe(11);
  });

  it('size 전송 시 size 만큼 오는지 확인', async () => {
    // given
    await createUser({
      nickname: 'user123',
      email: 'abcd@naver.com',
      provider: 'KAKAO',
    });
    const user = await getUser({ email: 'abcd@naver.com', provider: 'KAKAO' });
    const accessToken = jwtUtil.generateAccessToken({
      userId: Number(user?.user_id),
      provider: user!.provider!,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머1'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머2'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머3'님의 녹화가 시작되었습니다.`,
    });
    await createNotification({
      userId: Number(user?.user_id),
      content: `스트리머 '스트리머4'님의 녹화가 시작되었습니다.`,
    });

    // when
    const res = await request(app.getHttpServer())
      .get('/notifications?size=3')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', '0000'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('message', 'SUCCESS'); //result.response.dto.ts 참고
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBeLessThanOrEqual(3);
    expect(res.body.data.nextCursor).not.toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});
