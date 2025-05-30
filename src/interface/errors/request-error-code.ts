export const RequestErrorCode = {
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_NICKNAME_LENGTH: 'INVALID_NICKNAME_LENGTH',
  INVALID_CHANNEL_URL: 'INVALID_CHANNEL_URL',
  INVALID_SUBSCRIPTION_ID: 'INVALID_SUBSCRIPTION_ID',
  INVALID_QUERY_STRING: 'INVALID_QUERY_STRING',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_PROVIDER: 'INVALID_PROVIDER',
} as const;

export type RequestErrorCode = (typeof RequestErrorCode)[keyof typeof RequestErrorCode];

export const RequestErrorMessage: Record<RequestErrorCode, string> = {
  [RequestErrorCode.MISSING_REQUIRED_FIELD]: '필수 필드가 누락되었습니다.',
  [RequestErrorCode.INVALID_NICKNAME_LENGTH]: '닉네임은 2-10자 사이여야 합니다.',
  [RequestErrorCode.INVALID_CHANNEL_URL]: '채널 URL 형식이 올바르지 않습니다.',
  [RequestErrorCode.INVALID_SUBSCRIPTION_ID]: '구독 ID 형식이 올바르지 않습니다.',
  [RequestErrorCode.INVALID_QUERY_STRING]: '쿼리 string 값이 올바르지 않습니다.',
  [RequestErrorCode.UNAUTHORIZED]: '인증에 실패하였습니다.',
  [RequestErrorCode.INVALID_PROVIDER]: '소셜 제공자가 유효하지 않습니다.',
};
