import { Provider } from 'src/domain/user/user.entity';
export { Provider };

export class LogoutRequestCommand {
  readonly userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }
}
