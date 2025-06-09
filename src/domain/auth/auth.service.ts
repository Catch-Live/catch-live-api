import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Provider } from '../user/user.entity';
import { RequestCustomException } from 'src/interfaces/common/errors/request-custom-exception';

@Injectable()
export class AuthService {
  async getAccessToken(
    provider: Provider,
    authorizationCode: string,
    state?: string
  ): Promise<string> {
    try {
      if (provider === 'KAKAO') {
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID!,
          redirect_uri: process.env.KAKAO_REDIRECT_URI!,
          code: authorizationCode,
        });

        const { data } = await axios.post<AccessTokenResponse>(
          'https://kauth.kakao.com/oauth/token',
          params,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );

        return data.access_token;
      }

      if (provider === 'NAVER') {
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID!,
          client_secret: process.env.NAVER_CLIENT_SECRET!,
          code: authorizationCode,
          state: state || process.env.NAVER_STATE!,
        });

        const { data } = await axios.post<AccessTokenResponse>(
          'https://nid.naver.com/oauth2.0/token',
          params,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );

        return data.access_token;
      }

      if (provider === 'GOOGLE') {
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          code: authorizationCode,
        });

        const { data } = await axios.post<AccessTokenResponse>(
          'https://oauth2.googleapis.com/token',
          params,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );

        return data.access_token;
      }

      throw new RequestCustomException('지원하지 않는 소셜 로그인입니다.');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error.response?.data || error.message);
      }
      throw new RequestCustomException('로그인에 실패했습니다.');
    }
  }

  async getUserInfo(provider: Provider, accessToken: string): Promise<{ email: string }> {
    try {
      if (provider === 'KAKAO') {
        const { data } = await axios.get<KakaoUserInfoResponse>(
          'https://kapi.kakao.com/v2/user/me',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        return { email: data.kakao_account.email };
      }

      if (provider === 'NAVER') {
        const { data } = await axios.get<NaverUserInfoResponse>(
          'https://openapi.naver.com/v1/nid/me',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        return { email: data.response.email };
      }

      if (provider === 'GOOGLE') {
        const { data } = await axios.get<GoogleUserInfoResponse>(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        return { email: data.email };
      }

      throw new RequestCustomException('지원하지 않는 소셜 로그인입니다.');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error.response?.data || error.message);
      }
      throw new RequestCustomException('유저 정보 조회에 실패했습니다.');
    }
  }
}

interface AccessTokenResponse {
  access_token: string;
}

interface KakaoUserInfoResponse {
  kakao_account: {
    email: string;
  };
}

interface NaverUserInfoResponse {
  response: {
    email: string;
  };
}

interface GoogleUserInfoResponse {
  email: string;
}
