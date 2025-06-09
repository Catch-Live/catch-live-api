export const SOCIAL_LOGIN_STRATEGY = Symbol('SOCIAL_LOGIN_STRATEGY');

export interface SocialLoginStrategy {
  supports(provider: string): boolean;
  getAccessToken(authorizationCode: string, state?: string): Promise<string>;
  getUserInfo(accessToken: string): Promise<{ email: string }>;
}
