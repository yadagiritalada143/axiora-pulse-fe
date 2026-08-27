export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface VerifyOtpRequest {
  id?: number;
  emailOrMobile?: string;
  otp: number;
  flow: 'register' | 'login';
}

export interface ResendOtpRequest {
  id?: number;
  emailOrMobile?: string;
  flow: 'register' | 'login';
}

export interface VerifyLoginRequest {
  emailOrMobile: string;
  otp: number;
}

export interface GoogleLoginRequest {
  /** The ID token (JWT) returned by Google Identity Services on the client. */
  credential: string;
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
