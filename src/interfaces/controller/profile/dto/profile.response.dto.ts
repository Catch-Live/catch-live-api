export class ProfileResponseDto {
  readonly createdAt: string;
  readonly provider?: string;
  readonly email?: string;

  constructor(createdAt: Date, provider?: string, email?: string) {
    this.createdAt = createdAt.toISOString();
    this.provider = provider;
    this.email = email;
  }
}
