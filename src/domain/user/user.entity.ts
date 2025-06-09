export class UserEntity {
  constructor(
    public readonly userId: number,
    public readonly nickname: string,
    public readonly email: string,
    public readonly provider: Provider,
    public readonly isDeleted: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}
}

export const Provider = {
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
  GOOGLE: 'GOOGLE',
} as const;

export type Provider = (typeof Provider)[keyof typeof Provider];
