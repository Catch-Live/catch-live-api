import { Provider } from '../../user/user.entity';

export class SocialLoginCommand {
  constructor(
    public readonly provider: Provider,
    public readonly authorizationCode: string,
    public readonly state?: string
  ) {}
}
