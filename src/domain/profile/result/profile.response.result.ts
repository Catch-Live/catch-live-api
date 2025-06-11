import { $Enums } from '@prisma/client';

export class ProfileResponseResult {
  readonly createdAt: Date;
  readonly provider?: string;
  readonly email?: string;

  constructor(createdAt: Date, provider?: $Enums.Provider | null, email?: string | null) {
    this.createdAt = createdAt;
    if (provider) {
      this.provider = provider;
    }
    if (email) {
      this.email = email;
    }
  }
}
