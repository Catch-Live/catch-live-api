export const CACHE_SERVICE = Symbol('CacheService');

export interface CacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  getKeys(pattern: string): Promise<string[]>;
  getTTL(key: string): Promise<number>;
  getSetMembers(key: string): Promise<string[]>;
  removeFromSet(key: string, value: string): Promise<void>;
  getHashField(hashKey: string, field: string): Promise<string | null>;
  removeHashField(hashKey: string, field: string): Promise<void>;
  removeAllFromSet(key: string): Promise<void>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrangebyscore(key: string, maxScore: number, count: number): Promise<string[]>;
  zrem(key: string, member: string): Promise<void>;
}
