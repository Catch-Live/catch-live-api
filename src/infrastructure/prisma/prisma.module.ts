import { Global, Inject, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionManager } from './prisma.transaction-manager';
import {
  TRANSACTION_MANAGER,
  TransactionManager,
} from 'src/application/common/transaction-manager';
import { registerGlobalTransactionManager } from './transactional.decorator';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TRANSACTION_MANAGER,
      useClass: PrismaTransactionManager,
    },
  ],
  exports: [PrismaService, TRANSACTION_MANAGER],
})
export class PrismaModule {
  constructor(
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager
  ) {
    registerGlobalTransactionManager(this.transactionManager);
  }
}
