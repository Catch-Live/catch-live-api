import { LoginToken } from './login-token';

export interface NeedSignupResponse {
  needSignup: true;
  user: {
    email: string;
  };
}

export function isNeedSignupResponse(
  result: LoginToken | NeedSignupResponse
): result is NeedSignupResponse {
  return (result as NeedSignupResponse).needSignup === true;
}
