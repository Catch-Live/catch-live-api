export const DomainErrorCode = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  DUPLICATE_NICKNAME: 'DUPLICATE_NICKNAME',
  INVALID_AUTHORIZATION_CODE: 'INVALID_AUTHORIZATION_CODE',
  DUPLICATE_SUBSCRIPTION: 'DUPLICATE_SUBSCRIPTION',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_SERVER_ERROR: 'AUTH_SERVER_ERROR',
} as const;

export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export const DomainErrorMessage: Record<DomainErrorCode, string> = {
  [DomainErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [DomainErrorCode.SUBSCRIPTION_NOT_FOUND]: '구독 정보를 찾을 수 없습니다.',
  [DomainErrorCode.DUPLICATE_NICKNAME]: '이미 중복된 닉네임이 존재합니다.',
  [DomainErrorCode.DUPLICATE_SUBSCRIPTION]: '이미 구독 중인 채널이 존재합니다.',
  [DomainErrorCode.INVALID_AUTHORIZATION_CODE]: '인증 코드가 유효하지 않습니다.',
  [DomainErrorCode.AUTH_TOKEN_EXPIRED]: '토큰이 만료되었습니다. 다시 로그인해주세요.',
  [DomainErrorCode.AUTH_SERVER_ERROR]: '인증 서버에서 문제가 발생하였습니다.',
};
