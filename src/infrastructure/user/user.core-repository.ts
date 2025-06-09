import { Injectable } from '@nestjs/common';
import { Provider, UserEntity } from 'src/domain/user/user.entity';
import { UserRepository } from 'src/domain/user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { TokenEntity } from 'src/domain/user/token.entity';

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

  async findTokenById(userId: number): Promise<string | null> {
    const token = await this.prisma.token.findUnique({
      where: {
        user_id: userId,
      },
    });

    return token ? token.refresh_token : null;
  }

  async updateRefreshToken(userId: number, newRefreshToken: string): Promise<TokenEntity> {
    const token = await this.prisma.token.update({
      where: { user_id: userId },
      data: { refresh_token: newRefreshToken },
    });

    return new TokenEntity(
      Number(token.token_id),
      Number(token.user_id),
      token.refresh_token,
      token.created_at,
      token.updated_at
    );
  }
}
