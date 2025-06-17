export const DomainErrorCode = {
  COMMON_ERROR: '1500',
  DB_SERVER_ERROR: '1501',
  UNAUTHORIZED: '2400',
  INVALID_PROVIDER: '2401',
  INVALID_AUTHORIZATION_CODE: '2402',
  AUTH_TOKEN_EXPIRED: '2403',
  AUTH_SERVER_ERROR: '2500',
  DUPLICATED_NICKNAME: '3401',
  DUPLICATED_USER: '3402',
  USER_NOT_FOUND: '3403',
  SUBSCRIPTION_NOT_FOUND: '4401',
  DUPLICATED_SUBSCRIPTION: '4402',
  SUBSCRIPTION_LIMIT_EXCEEDED: '4403',
} as const;

export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

const SUBSCRIPTION_LIMIT = process.env.SUBSCRIPTION_LIMIT;

export const DomainErrorMessage: Record<DomainErrorCode, string> = {
  [DomainErrorCode.COMMON_ERROR]: '서버에서 요청을 처리할 수 없습니다.',
  [DomainErrorCode.DB_SERVER_ERROR]: 'DB에 문제가 발생하였습니다.',
  [DomainErrorCode.UNAUTHORIZED]: '인증에 실패하였습니다.',
  [DomainErrorCode.INVALID_PROVIDER]: '소셜 제공자가 유효하지 않습니다.',
  [DomainErrorCode.INVALID_AUTHORIZATION_CODE]: '인증 코드가 유효하지 않습니다.',
  [DomainErrorCode.AUTH_TOKEN_EXPIRED]: '토큰이 만료되었습니다. 다시 로그인해주세요.',
  [DomainErrorCode.AUTH_SERVER_ERROR]: '인증 서버에서 문제가 발생하였습니다.',
  [DomainErrorCode.DUPLICATED_NICKNAME]: '이미 중복된 닉네임이 존재합니다.',
  [DomainErrorCode.DUPLICATED_USER]: '이미 가입된 사용자입니다.',
  [DomainErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [DomainErrorCode.SUBSCRIPTION_NOT_FOUND]: '구독 정보를 찾을 수 없습니다.',
  [DomainErrorCode.DUPLICATED_SUBSCRIPTION]: '이미 구독 중인 채널이 존재합니다.',
  [DomainErrorCode.SUBSCRIPTION_LIMIT_EXCEEDED]: `더 이상 채널을 구독할 수 없습니다.(최대 ${SUBSCRIPTION_LIMIT}개)`,
};
