export interface LoginResponse {
  userid: number;
  username: string;
  loginMFA: boolean;
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

export interface ResendOtpResponse {
  userid: number;
  username: string;
  registerMFA: boolean;
}
