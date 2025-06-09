import { Inject, Injectable } from '@nestjs/common';
import { Provider, UserEntity } from './user.entity';
import { USER_REPOSITORY, UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async getUserByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null> {
    return this.userRepository.findByProviderAndEmail(provider, email);
  }
}
