// test/utils/reset-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resetDatabase = async () => {
  await prisma.recording.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.streamer.deleteMany();
  await prisma.token.deleteMany();
  await prisma.notification.deleteMany();
};
