import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  VerifyLoginRequest,
  GoogleLoginRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  VerifyForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpResponse,
  VerifyLoginResponse,
  GoogleLoginResponse,
  ResendOtpResponse,
  ForgotPasswordResponse,
  VerifyForgotPasswordResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  AdminLoginRequest,
  AdminLoginResponse,
} from '@/features/auth/types';
import type { User } from '@/types/api.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { tokenManager } from '@services/api/tokenManager';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
    if (data.access_token && data.refresh_token) {
      tokenManager.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },
  async verifyLogin(payload: VerifyLoginRequest): Promise<VerifyLoginResponse> {
    const { data } = await apiClient.post<VerifyLoginResponse>(
      API_ENDPOINTS.AUTH.VERIFY_LOGIN,
      payload,
    );
    tokenManager.setTokens(data.access_token, data.refresh_token);

    return data;
  },

  async googleLogin(payload: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    const { data } = await apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, payload);
    tokenManager.setTokens(data.access_token, data.refresh_token);

    return data;
  },

  async adminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post<AdminLoginResponse>(
      API_ENDPOINTS.AUTH.ADMIN_LOGIN,
      payload,
    );

    tokenManager.setTokens(data.access_token, data.refresh_token);

    return data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, payload);
    return data;
  },

  async verifyOTP(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await apiClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      payload,
    );
    if (data.status === 'success' && data.access_token && data.refresh_token) {
      tokenManager.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },

  async resendOTP(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    const { data } = await apiClient.post<ResendOtpResponse>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      payload,
    );
    return data;
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const { data } = await apiClient.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST,
      payload,
    );
    return data;
  },

  async verifyForgotPassword(
    payload: VerifyForgotPasswordRequest,
  ): Promise<VerifyForgotPasswordResponse> {
    const { data } = await apiClient.post<VerifyForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY,
      payload,
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { data } = await apiClient.post<ResetPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET,
      payload,
    );
    return data;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const { data } = await apiClient.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch {
      // Ignored: clear local session tokens even if network fails
    } finally {
      tokenManager.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },
};
