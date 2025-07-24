export const API_PREFIX = 'api/v1';

export const NOTIFICATION_PAGE_SIZE: number = 10;
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const REFRESH_TOKEN_COOKIE_TTL = 7 * 24 * 60 * 60 * 1000; // 7일
export const BCRYPT_ROUNDS = 10;

export const OAUTH_URL = {
  TOKEN: {
    KAKAO: 'https://kauth.kakao.com/oauth/token',
    NAVER: 'https://nid.naver.com/oauth2.0/token',
    GOOGLE: 'https://oauth2.googleapis.com/token',
  },
  USER_INFO: {
    KAKAO: 'https://kapi.kakao.com/v2/user/me',
    NAVER: 'https://openapi.naver.com/v1/nid/me',
    GOOGLE: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
};

export const SERVER_URL = {
  MONITORING: {
    BASE: process.env.NODE_ENV === 'production' ? 'http://monitor:3001' : 'http://localhost:3001',
  },
};

export const JWT_CONFIG = {
  ACCESS: {
    EXPIRES_IN: '1h',
  },
  REFRESH: {
    EXPIRES_IN: '7d',
  },
};
