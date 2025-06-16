import { Request } from 'express';
import { IsEmail } from 'class-validator';
import { Provider } from 'src/domain/user/user.command';

export class UserRequestDto {
  readonly userId: number;
  readonly provider: Provider;

  @IsEmail()
  readonly email: string;

  constructor(req: Request) {
    if (req.user !== undefined && req.user['userId'] !== undefined) {
      const convertedUserId = Number(req.user['userId']);
      if (!isNaN(convertedUserId) && convertedUserId > 0) {
        this.userId = convertedUserId;
      }
    }

    if (req.user !== undefined && req.user['provider'] !== undefined) {
      const convertedProvider = String(req.user['provider']);
      if (Object.values(Provider).includes(convertedProvider as Provider)) {
        this.provider = convertedProvider as Provider;
      }
    }

    if (req.user !== undefined && req.user['email'] !== undefined) {
      this.email = String(req.user['email']);
    } else {
      this.email = '';
    }
  }
}
