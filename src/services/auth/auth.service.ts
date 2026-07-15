import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
} from '@/features/auth/types';
import type { User } from '@/types/api.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload, {
      withCredentials: true,
    });
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
    return data;
  },

  async resendOTP(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    const { data } = await apiClient.post<ResendOtpResponse>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      payload,
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.AUTH.LOGOUT,
      {},
      {
        withCredentials: true,
      },
    );
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME, {
      withCredentials: true,
    });
    return data;
  },
};
