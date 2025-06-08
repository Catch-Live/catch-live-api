export class ProfileResponseDto {
  readonly code: string;
  readonly message: string;
  readonly data: {
    readonly provider: string;
    readonly email: string;
    readonly createdAt: string;
  };

  constructor(code: string, message: string, provider: string, email: string, createdAt: Date) {
    this.code = code;
    this.message = message;
    this.data = {
      provider,
      email,
      createdAt: createdAt.toISOString(),
    };
  }
}
