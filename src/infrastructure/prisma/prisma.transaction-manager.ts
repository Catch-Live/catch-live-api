import { TransactionManager } from 'src/application/common/transaction-manager';
import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async beginTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
