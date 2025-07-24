import { Provider } from '../../user/user.entity';

export interface SocialLoginCommand {
  provider: Provider;
  authorizationCode: string;
  state?: string;
}
