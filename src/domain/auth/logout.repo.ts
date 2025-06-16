import { LogoutResponseEntity } from './entity/logout.entity';
import { LogoutRequestCommand } from './command/logout.command';

export const LOGOUT_REPOSITORY = Symbol('LogoutRepository');

export interface LogoutRepository {
  logout(requestCommand: LogoutRequestCommand): Promise<LogoutResponseEntity>;
}
