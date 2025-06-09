import { SocialLoginStrategy } from 'src/domain/auth/strategy/social-login.strategy';
import axios from 'axios';
import { Provider } from 'src/domain/user/user.entity';

export class GoogleStrategy implements SocialLoginStrategy {
  supports(provider: string): boolean {
    return provider === Provider.GOOGLE;
  }

  async getAccessToken(authorizationCode: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      code: authorizationCode,
    });

    const { data } = await axios.post<{ access_token: string }>(
      'https://oauth2.googleapis.com/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<{ email: string }> {
    const { data } = await axios.get<{ email: string }>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return { email: data.email };
  }
}
