import { SocialLoginStrategy } from 'src/domain/auth/strategy/social-login.strategy';
import axios from 'axios';
import { Provider } from 'src/domain/user/user.entity';
import { OAUTH_URL } from 'src/support/constants';

export class NaverStrategy implements SocialLoginStrategy {
  supports(provider: string): boolean {
    return provider === Provider.NAVER;
  }

  async getAccessToken(authorizationCode: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NAVER_CLIENT_ID!,
      client_secret: process.env.NAVER_CLIENT_SECRET!,
      code: authorizationCode,
      state,
    });

    const { data } = await axios.post<{ access_token: string }>(OAUTH_URL.TOKEN.NAVER, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<{ email: string }> {
    const { data } = await axios.get<{ response: { email: string } }>(OAUTH_URL.USER_INFO.NAVER, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { email: data.response.email };
  }
}
