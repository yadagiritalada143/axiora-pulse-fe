export interface LoginResponse {
  status: 'success';
  message: string;
}

export interface RegisterResponse {
  userid: number;
  username: string;
  registerMFA: boolean;
}

export interface VerifyOtpResponse {
  hasActivePlan?: boolean;
  status: 'success' | 'failed';
  message: string;
  jwt?: string;
  access_token?: string;
  referesh_token?: string;
}

export interface VerifyLoginResponse {
  status: 'success';
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  /** Present once the backend starts sending it. Defaults to false when absent. */
  hasActivePlan?: boolean;
}

export interface ResendOtpResponse {
  userid: number;
  username: string;
  registerMFA: boolean;
}

export interface ForgotPasswordResponse {
  status: 'success';
  message: string;
}

export interface VerifyForgotPasswordResponse {
  status: 'success';
  message: string;
  reset_token: string;
}

export interface ResetPasswordResponse {
  status: 'success';
  message: string;
}

export interface ChangePasswordResponse {
  status: 'success';
  message: string;
}
