import type {
  AdminUsersResponse,
  GrowthGranularity,
  ListAdminUsersParams,
  UserGrowthResponse,
} from '@/types/admin.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const adminService = {
  async listUsers(params?: ListAdminUsersParams): Promise<AdminUsersResponse> {
    const { data } = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return data;
  },

  async getUserGrowth(granularity: GrowthGranularity): Promise<UserGrowthResponse> {
    const { data } = await apiClient.get<UserGrowthResponse>(API_ENDPOINTS.ADMIN.USER_GROWTH, {
      params: { granularity },
    });
    return data;
  },
};
