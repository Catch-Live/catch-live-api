import { SignoutResponseResult } from './result/signout.response.result';
import { UserRequestDto } from 'src/interfaces/controller/user/dto/user.request.dto';

export const SIGNOUT_REPOSITORY = Symbol('SignoutRepository');

export interface SignoutRepository {
  updateMany(requestDto: UserRequestDto): Promise<SignoutResponseResult>;
}
