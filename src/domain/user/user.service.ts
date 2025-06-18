import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Provider, UserEntity } from './user.entity';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import { SignupCommand } from '../auth/command/signup.command';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';
import { UserRequestCommand } from './user.command';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  private readonly logger = new Logger(UserService.name);

  getUserByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null> {
    return this.userRepository.findByProviderAndEmail(provider, email);
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    return this.userRepository.updateRefreshToken(userId, refreshToken);
  }

  async signup(command: SignupCommand): Promise<void> {
    const { email, nickname, provider } = command;

    const existNickname = await this.userRepository.findByNickname(nickname);

    if (existNickname) {
      throw new DomainCustomException(HttpStatus.CONFLICT, DomainErrorCode.DUPLICATED_NICKNAME);
    }

    const user = await this.userRepository.findByProviderAndEmail(provider, email);

    if (!user) {
      const userId = await this.userRepository.createUser(command);
      await this.userRepository.upsertToken(userId);
      return;
    }

    if (user.isDeleted) {
      await this.userRepository.restoreUser(user.userId, command);
      await this.userRepository.upsertToken(user.userId);
      return;
    }
  }

  async compareWithStoredRefreshToken(refreshToken: string, userId: number) {
    const userToken = await this.userRepository.findTokenById(userId);

    if (userToken === null) {
      this.logger.error('DB 토큰 정보 없음');
      throw new DomainCustomException(HttpStatus.UNAUTHORIZED, DomainErrorCode.UNAUTHORIZED);
    }

    userToken.compare(refreshToken);
  }

  async signout(command: UserRequestCommand) {
    const queryData = await this.userRepository.signout(command);
    return queryData;
  }
}
