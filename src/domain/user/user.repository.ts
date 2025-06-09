import { Provider, UserEntity } from './user.entity';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null>;
}
