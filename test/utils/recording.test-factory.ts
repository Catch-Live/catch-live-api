import { PrismaClient } from '@prisma/client';
import { Platform } from 'src/domain/recording/live-session.entity';

const prisma = new PrismaClient();

export const createUser = async ({ nickname, email }: { nickname?: string; email?: string }) => {
  const user = await prisma.user.create({
    data: {
      nickname: nickname,
      email: email,
    },
  });

  return user;
};

export const createStreamer = async ({
  platform,
  channel_id,
  channel_name,
}: {
  platform: Platform;
  channel_id: string;
  channel_name: string;
}) => {
  const streamer = await prisma.streamer.create({
    data: {
      platform: platform,
      channel_id: channel_id,
      channel_name: channel_name,
    },
  });

  return streamer;
};

export const createSubscription = async ({
  user_id,
  streamer_id,
  is_connected,
}: {
  user_id: number;
  streamer_id: number;
  is_connected: boolean;
}) => {
  const subscription = await prisma.subscription.create({
    data: {
      user_id: user_id,
      streamer_id: streamer_id,
      is_connected: is_connected,
    },
  });

  return subscription;
};

export const createLiveSessionWithRecording = async ({
  streamerId,
  channelId,
  channelName,
  title,
}: {
  streamerId: number;
  channelId: string;
  channelName: string;
  title: string;
}) => {
  const liveSession = await prisma.liveSession.create({
    data: {
      streamer_id: streamerId,
      channel_id: channelId,
      channel_name: channelName,
      title,
    },
  });

  await prisma.recording.create({
    data: {
      live_session_id: liveSession.live_session_id,
    },
  });

  return liveSession;
};
