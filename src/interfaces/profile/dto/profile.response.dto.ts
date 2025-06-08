export class ProfileResponseDto {
  readonly code: string;
  readonly message: string;
  readonly data: {
    readonly createdAt: string;
    readonly provider?: string;
    readonly email?: string;
  };

  constructor(code: string, message: string, createdAt: Date, provider?: string, email?: string) {
    this.code = code;
    this.message = message;
    this.data = {
      createdAt: createdAt.toISOString(),
      provider,
      email,
    };
  }
}
