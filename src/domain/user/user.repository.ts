import { TokenEntity } from './token.entity';
import { Provider, UserEntity } from './user.entity';
import { LogoutRequestCommand } from '../auth/command/logout.command';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null>;
  findTokenById(userId: number): Promise<string | null>;
  updateRefreshToken(userId: number, refreshToken: string): Promise<TokenEntity>;
  logout(requestCommand: LogoutRequestCommand): Promise<UserEntity>;
}
