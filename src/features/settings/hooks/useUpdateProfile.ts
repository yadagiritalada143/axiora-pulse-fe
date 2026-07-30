import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { isApiError } from '@/types/error.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { queryKeys } from '@constants/queryKeys';
import { apiClient } from '@services/api';
import { useAuthStore } from '@store/auth.store';

interface UpdateProfilePayload {
  name: string;
  email: string;
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
      updateUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      toast.success('Profile updated.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update your profile.');
    },
  });
}
