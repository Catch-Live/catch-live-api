import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Provider, UserEntity } from './user.entity';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import { SignupCommand } from '../auth/command/signup.command';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';
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
    const nickname = await this.userRepository.findByNickname(command.nickname);

    if (nickname) {
      throw new DomainCustomException(HttpStatus.CONFLICT, DomainErrorCode.DUPLICATED_NICKNAME);
    }

    const userId = await this.userRepository.createUser(command);

    await this.userRepository.createToken(userId);
  }

  async compareWithStoredRefreshToken(refreshToken: string, userId: number) {
    const userToken = await this.userRepository.findTokenById(userId);

    if (userToken === null) {
      this.logger.error('DB 토큰 정보 없음');
      throw new DomainCustomException(HttpStatus.UNAUTHORIZED, DomainErrorCode.UNAUTHORIZED);
    }

    userToken.compare(refreshToken);
  }
}
