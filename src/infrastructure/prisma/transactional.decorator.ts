import { DomainErrorCode } from 'src/domain/common/errors/domain-error-code';
import { DomainCustomException } from 'src/domain/common/errors/domain-custom-exception';
import { HttpStatus } from '@nestjs/common';
import { TransactionManager } from 'src/application/common/transaction-manager';

let globalTransactionManager: TransactionManager | null = null;

export function registerGlobalTransactionManager(manager: TransactionManager) {
  globalTransactionManager = manager;
}

export function Transactional() {
  return function (target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<unknown>;

    descriptor.value = async function (...args: any[]) {
      if (!globalTransactionManager) {
        throw new DomainCustomException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          DomainErrorCode.DB_SERVER_ERROR
        );
      }

      return await globalTransactionManager.beginTransaction(
        () => originalMethod.apply(this, args) as Promise<unknown>
      );
    };

    return descriptor;
  };
}
