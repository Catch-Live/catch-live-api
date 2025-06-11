import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Provider, UserEntity } from './user.entity';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import { hash } from 'bcrypt';
import { BCRYPT_ROUNDS } from 'src/support/constants';
import { SignupCommand } from '../auth/command/signup.command';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

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
}
