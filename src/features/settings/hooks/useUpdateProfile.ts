import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { isApiError } from '@/types/error.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { queryKeys } from '@constants/queryKeys';
import { apiClient } from '@services/api';
import { useAuthStore } from '@store/auth.store';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User> | User>(
    API_ENDPOINTS.USER.UPDATE_PROFILE,
    payload,
  );
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data;
  }
  return resData as User;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      const normalizedAvatar =
        user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== ''
          ? user.avatarUrl
          : null;
      const normalizedUser = {
        ...user,
        avatarUrl: normalizedAvatar,
        avatar_url: normalizedAvatar,
      };
      updateUser(normalizedUser);
      queryClient.setQueryData(queryKeys.user.profile(), normalizedUser);
      queryClient.setQueryData(queryKeys.user.details(), (prev: unknown) => {
        if (!prev || typeof prev !== 'object') return prev;
        return {
          ...prev,
          avatar_url: normalizedAvatar,
          avatarUrl: normalizedAvatar,
        };
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.details() });
      toast.success('Profile updated successfully.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update your profile.');
    },
  });
}
