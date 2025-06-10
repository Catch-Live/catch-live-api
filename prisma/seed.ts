import { PrismaClient } from '@prisma/client';
import {
  createLiveSessionWithRecording,
  createStreamer,
  createSubscription,
  createUser,
} from '../src/support/recording-factory.util';

const prisma = new PrismaClient();

async function main() {
  const user = await createUser({ nickname: '테스트유저1' });
  const streamer = await createStreamer({
    platform: 'CHZZK',
    channel_id: 'asdf1234',
    channel_name: '경제 상식',
  });
  await createSubscription({
    user_id: Number(user.user_id),
    streamer_id: Number(streamer.streamer_id),
    is_connected: true,
  });

  for (let i = 0; i < 11; i++) {
    await createLiveSessionWithRecording({
      streamerId: Number(streamer.streamer_id),
      channelId: 'asdf1234',
      channelName: `경제 상식`,
      title: `경제 아날로그-${i}`,
    });
  }
}

void (async () => {
  try {
    await main();
    console.log('Seeding complete');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
