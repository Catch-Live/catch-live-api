import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionManager } from './prisma.transaction-manager';
import { TRANSACTION_MANAGER } from 'src/application/common/transaction-manager';

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
export class PrismaModule {}
