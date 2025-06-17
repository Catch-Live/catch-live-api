import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Provider, UserEntity } from './user.entity';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import { hash } from 'bcrypt';
import { BCRYPT_ROUNDS } from 'src/support/constants';
import { SignupCommand } from '../auth/command/signup.command';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';
import * as bcrypt from 'bcrypt';
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
    const hashedToken = await hash(refreshToken, BCRYPT_ROUNDS);

    return this.userRepository.updateRefreshToken(userId, hashedToken);
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
    const encryptedToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const userToken = await this.userRepository.findTokenById(userId);

    if (userToken === null) {
      this.logger.error('DB 토큰 정보 없음');
      throw new DomainCustomException(HttpStatus.UNAUTHORIZED, DomainErrorCode.UNAUTHORIZED);
    }

    await userToken.compare(encryptedToken);
  }
}
