import { SignoutRequestCommand } from './command/signout.command';
import { SignoutResponseEntity } from './entity/signout.entity';

export const SIGNOUT_REPOSITORY = Symbol('SignoutRepository');

export interface SignoutRepository {
  updateMany(requestDto: SignoutRequestCommand): Promise<SignoutResponseEntity>;
}
