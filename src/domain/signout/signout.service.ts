import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SignoutCoreRepository } from 'src/infrastructure/signout/signout.core-repository';
import { SignoutResponseEntity } from 'src/domain/signout/entity/signout.response.entity';

@Injectable()
export class SignoutService {
  constructor(private readonly signoutCoreRepository: SignoutCoreRepository) {}

  async getSignout() {
    try {
      const data = await this.signoutCoreRepository.updateMany();
      if (data === true) {
        return new SignoutResponseEntity(true);
      }
    } catch {
      throw new InternalServerErrorException('서버에서 요청을 처리할 수 없습니다.');
    }
  }
}
