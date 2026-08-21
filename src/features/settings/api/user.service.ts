import type { ChangePasswordRequest, ChangePasswordResponse } from '@/features/auth/types';
import type { UpdateUserDetailsPayload, User, UserDetails } from '@/types/api.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  async getUserDetails(): Promise<UserDetails> {
    const { data } = await apiClient.get<UserDetails>(API_ENDPOINTS.USER.DETAILS);
    return data;
  },

  async updateUserDetails(payload: UpdateUserDetailsPayload): Promise<UserDetails> {
    const { data } = await apiClient.post<UserDetails>(API_ENDPOINTS.USER.DETAILS, payload);
    return data;
  },

  async updateProfile(payload: { name: string; email: string }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User> | User>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      payload,
    );
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return resData.data;
    }
    return resData as User;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const { data } = await apiClient.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return data;
  },
};
