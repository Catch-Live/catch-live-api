import { IsIn, IsNumber, IsEmail } from 'class-validator';
import { Provider } from 'src/domain/signout/result/signout.result';
export { Provider };

export class SignoutRequestCommand {
  @IsNumber()
  readonly userId: number;

  @IsIn(Object.values(Provider))
  provider: Provider;

  @IsEmail()
  readonly email: string;
}
