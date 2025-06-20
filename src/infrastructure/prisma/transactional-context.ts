import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

type PrismaTxContextType = {
  tx: PrismaClient;
  id: string;
};

const prismaTxStorage = new AsyncLocalStorage<PrismaTxContextType>();

export const PrismaTxContext = {
  get(): PrismaClient | undefined {
    return prismaTxStorage.getStore()?.tx;
  },
  getId(): string | undefined {
    return prismaTxStorage.getStore()?.id;
  },

  run<T>(tx: PrismaClient, callback: () => Promise<T>): Promise<T> {
    const context = { tx, id: randomUUID() };
    return prismaTxStorage.run(context, callback);
  },
};
