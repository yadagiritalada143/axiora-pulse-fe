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
  flow: 'register' | 'login';
}

export interface ResendOtpRequest {
  id: number;
  flow: 'register' | 'login';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
