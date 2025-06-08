import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileUseCase {
  getProfile() {
    return { provider: 'kakao', email: 'kakao@kakao.com', createdAt: new Date() };
  }
}
