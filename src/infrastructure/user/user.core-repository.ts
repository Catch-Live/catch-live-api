import { Injectable } from '@nestjs/common';
import { Provider, UserEntity } from 'src/domain/user/user.entity';
import { UserRepository } from 'src/domain/user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserCoreRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderAndEmail(provider: Provider, email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { provider_email: { provider, email } },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(
      Number(user.user_id),
      user.nickname ?? '',
      user.email ?? '',
      user.provider ?? 'KAKAO',
      user.is_deleted ?? false,
      user.created_at ?? null,
      user.updated_at ?? null
    );
  }
}
