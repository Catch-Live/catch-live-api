import { SignupCommand } from '../auth/command/signup.command';
import { TokenEntity } from './token.entity';
import { Provider, UserEntity } from './user.entity';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null>;
  findTokenById(userId: number): Promise<string | null>;
  updateRefreshToken(userId: number, refreshToken: string): Promise<TokenEntity>;
  createUser(command: SignupCommand): Promise<number>;
  createToken(userId: number): Promise<void>;
}
