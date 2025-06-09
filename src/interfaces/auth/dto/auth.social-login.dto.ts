import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SocialLoginCommand } from 'src/domain/auth/command/social-login.command';
import { Provider } from 'src/domain/user/user.entity';

export class SocialLoginDto {
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.toUpperCase() : value
  )
  @IsIn(Object.values(Provider))
  provider: Provider;

  @IsString()
  authorizationCode: string;

  @IsOptional()
  @IsString()
  state?: string;

  toCommand(): SocialLoginCommand {
    return new SocialLoginCommand(this.provider, this.authorizationCode, this.state);
  }
}
