import { IsIn, IsNumber } from 'class-validator';
import { Provider } from 'src/domain/user/user.entity';
export { Provider };

export class UserRequestCommand {
  @IsNumber()
  readonly userId: number;

  @IsIn(Object.values(Provider))
  provider: Provider;
}
