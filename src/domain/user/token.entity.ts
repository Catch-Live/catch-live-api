export class TokenEntity {
  constructor(
    public readonly tokenId: number,
    public readonly userId: number,
    public readonly refreshToken: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
