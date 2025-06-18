import { SignupCommand } from '../auth/command/signup.command';
import { TokenEntity } from './token.entity';
import { Provider, UserEntity } from './user.entity';
import { LogoutRequestCommand } from '../auth/command/logout.command';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null>;
  findTokenById(userId: number): Promise<TokenEntity | null>;
  updateRefreshToken(userId: number, refreshToken: string): Promise<TokenEntity>;
  createUser(command: SignupCommand): Promise<number>;
  createToken(userId: number): Promise<void>;
  findByNickname(nickname: string): Promise<UserEntity | null>;
  logout(requestCommand: LogoutRequestCommand): Promise<UserEntity>;
}
