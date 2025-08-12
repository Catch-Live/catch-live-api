import { TransactionManager } from 'src/application/common/transaction-manager';
import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaTxContext } from './transactional-context';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  beginTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return PrismaTxContext.run(tx as PrismaClient, fn);
    });
  }
}
