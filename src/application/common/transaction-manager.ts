export const TRANSACTION_MANAGER = Symbol('TransactionManager');

export interface TransactionManager {
  beginTransaction<T>(fn: () => Promise<T>): Promise<T>;
}
