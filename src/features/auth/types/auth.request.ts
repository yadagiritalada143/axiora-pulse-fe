export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface VerifyOtpRequest {
  id: number;
  otp: number;
  flow: 'register';
}

export interface ResendOtpRequest {
  id: number;
  flow: 'register' | 'login';
}

export interface VerifyLoginRequest {
  emailOrMobile: string;
  otp: number;
}

export interface ForgotPasswordRequest {
  emailOrMobile: string;
}

export interface VerifyForgotPasswordRequest {
  emailOrMobile: string;
  code: number;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
