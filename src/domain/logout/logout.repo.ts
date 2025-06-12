import { LogoutResponseResult } from './result/logout.response.result';
import { LogoutRequestDto } from 'src/interfaces/controller/logout/dto/logout.request.dto';

export const LOGOUT_REPOSITORY = Symbol('LogoutRepository');

export interface LogoutRepository {
  updateMany(requestDto: LogoutRequestDto): Promise<LogoutResponseResult>;
}
