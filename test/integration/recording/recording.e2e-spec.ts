import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Streamer } from '@prisma/client';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { resetDatabase } from 'test/utils/reset-db';
import {
  createLiveSessionWithRecording,
  createStreamer,
  createSubscription,
  createUser,
} from 'src/support/recording-factory.util';
import { GetRecordingsRequestDto } from 'src/interfaces/controller/recording/dto/recording.request.dto';

describe('RecordingController (e2e) with real MySQL', () => {
  let app: INestApplication<App>;
  let streamer: Streamer;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      })
    );

    await app.init();
  });

  beforeEach(async () => {
    await resetDatabase();
    const user = await createUser({ nickname: 'user123' });
    streamer = await createStreamer({
      platform: 'CHZZK',
      channel_id: 'd7ddd7585',
      channel_name: '경제 상식',
    });
    await createSubscription({
      user_id: Number(user.user_id),
      streamer_id: Number(streamer.streamer_id),
      is_connected: true,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /recordings', () => {
    it('database로 부터 모든 recordings 정보를 받아 response를 반환해야 한다. - 성공', async () => {
      // given
      await createLiveSessionWithRecording({
        streamerId: Number(streamer.streamer_id),
        channelId: 'd7ddd7585',
        channelName: '경제 상식',
        title: '경제 한마당 시작!',
      });
      // when
      const res = await request(app.getHttpServer()).get('/recordings').expect(200);

      // then
      expect(res.body.message).toBe('OK');
      expect(Array.isArray(res.body.data.recordings)).toBe(true);
      expect(res.body.data.recordings.length).toBe(1);
    });

    it('q=여행 로 검색했을 때 "여행"이 포함된 녹화들만 반환해야 한다 - 성공', async () => {
      // given
      await createLiveSessionWithRecording({
        streamerId: Number(streamer.streamer_id),
        channelId: 'd7ddd7585',
        channelName: '경제 상식',
        title: '여행 가자1',
      });
      await createLiveSessionWithRecording({
        streamerId: Number(streamer.streamer_id),
        channelId: 'd7ddd7585',
        channelName: '경제 상식',
        title: '경제 한마당 시작!',
      });
      await createLiveSessionWithRecording({
        streamerId: Number(streamer.streamer_id),
        channelId: 'd7ddd7585',
        channelName: '경제 상식',
        title: '한국 경제...',
      });
      const getRecordingsDto = new GetRecordingsRequestDto();
      getRecordingsDto.q = '여행';

      // when
      const res = await request(app.getHttpServer()).get('/recordings').query(getRecordingsDto);

      // then
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.recordings)).toBe(true);
      expect(res.body.data.recordings.length).toBe(1);
      // 반환된 모든 녹화의 제목에 '뮤비'가 포함되어야 함
      for (const recording of res.body.data.recordings) {
        expect(recording.title).toContain('여행');
      }
    });
  });
});
