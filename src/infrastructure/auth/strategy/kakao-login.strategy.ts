import { SocialLoginStrategy } from 'src/domain/auth/strategy/social-login.strategy';
import axios from 'axios';
import { Provider } from 'src/domain/user/user.entity';

export class KakaoStrategy implements SocialLoginStrategy {
  supports(provider: string): boolean {
    return provider === Provider.KAKAO;
  }

  async getAccessToken(authorizationCode: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      code: authorizationCode,
    });

    const { data } = await axios.post<{ access_token: string }>(
      'https://kauth.kakao.com/oauth/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<{ email: string }> {
    const { data } = await axios.get<{ kakao_account: { email: string } }>(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return { email: data.kakao_account.email };
  }
}
