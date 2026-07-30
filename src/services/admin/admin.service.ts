import type { AdminUsersResponse, ListAdminUsersParams } from '@/types/admin.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const adminService = {
  async listUsers(params?: ListAdminUsersParams): Promise<AdminUsersResponse> {
    const { data } = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return data;
  },
};
