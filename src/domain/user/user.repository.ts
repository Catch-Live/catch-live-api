import { SignupCommand } from '../auth/command/signup.command';
import { TokenEntity } from './token.entity';
import { Provider, UserEntity } from './user.entity';
import { UserRequestCommand } from './user.command';
import { LogoutRequestCommand } from '../auth/command/logout.command';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null>;
  findTokenById(userId: number): Promise<TokenEntity | null>;
  updateRefreshToken(userId: number, refreshToken: string): Promise<TokenEntity>;
  createUser(command: SignupCommand): Promise<number>;
  upsertToken(userId: number): Promise<void>;
  findByNickname(nickname: string): Promise<UserEntity | null>;
  signout(command: UserRequestCommand): Promise<boolean>;
  logout(requestCommand: LogoutRequestCommand): Promise<UserEntity>;
  restoreUser(userId: number, command: SignupCommand): Promise<void>;
}
