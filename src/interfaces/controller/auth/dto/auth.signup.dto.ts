import { Transform } from 'class-transformer';
import { IsIn, IsString, Length } from 'class-validator';
import { SignupCommand } from 'src/domain/auth/command/signup.command';
import { Provider } from 'src/domain/user/user.entity';

export class SignupDto {
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.toUpperCase() : value
  )
  @IsIn(Object.values(Provider))
  provider: Provider;

  @IsString()
  email: string;

  @IsString()
  @Length(2, 10)
  nickname: string;

  toCommand(): SignupCommand {
    return {
      provider: this.provider,
      email: this.email,
      nickname: this.nickname,
    };
  }
}
