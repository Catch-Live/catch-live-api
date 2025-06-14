export class LogoutRequestDto {
  readonly userId: number;
  readonly provider: string;
  readonly email: string;

  constructor({ userId, provider, email }: { userId?: any; provider?: any; email?: any }) {
    this.userId = isNaN(Number(userId)) ? 0 : Number(userId);
    this.provider = provider ? String(provider) : '';
    this.email = email ? String(email) : '';
  }
}
