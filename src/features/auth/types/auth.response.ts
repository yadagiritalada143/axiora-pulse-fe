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
  status: 'success' | 'failed';
  message: string;
  jwt?: string;
}

export interface VerifyLoginResponse {
  status: 'success';
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
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
