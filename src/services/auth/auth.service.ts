import type { AuthSession, User } from '@/types/api.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload,
    );
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return data.data;
  },
};
