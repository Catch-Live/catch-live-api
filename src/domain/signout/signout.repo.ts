import { SignoutResponseResult } from './result/signout.response.result';
import { SignoutRequestDto } from 'src/interfaces/controller/signout/dto/signout.request.dto';

export const SIGNOUT_REPOSITORY = Symbol('SignoutRepository');

export interface SignoutRepository {
  updateMany(requestDto: SignoutRequestDto): Promise<SignoutResponseResult>;
}
