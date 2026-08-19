import type { AccountRole } from '@/types/common.types';

export interface LoginResponse {
  status: 'success';
  message: string;
  userid?: number;
}

export interface AdminLoginResponse {
  status: 'success';
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  role: 'admin';
  actions: string[];
}

export interface RegisterResponse {
  userid: number;
  username: string;
  registerMFA: boolean;
}

export interface AuthActionsData {
  payment: boolean;
  interactive_questions: boolean;
}

export interface VerifyOtpResponse {
  status: 'success' | 'failed';
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  /** Present once the backend starts sending it. Defaults to false when absent. */
  hasActivePlan?: boolean;
  role?: AccountRole;
  auth_actions?: AuthActionsData | null;
}

export interface VerifyLoginResponse {
  status: 'success';
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  role: AccountRole;
  /** Present once the backend starts sending it. Defaults to false when absent. */
  hasActivePlan?: boolean;
  auth_actions?: AuthActionsData | null;
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
