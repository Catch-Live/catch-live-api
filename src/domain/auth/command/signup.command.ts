import { Provider } from 'src/domain/user/user.entity';

export interface SignupCommand {
  provider: Provider;
  email: string;
  nickname: string;
}
