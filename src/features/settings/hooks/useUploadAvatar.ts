import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { userService } from '@features/settings/api/user.service';
import { useAuthStore } from '@store/auth.store';

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (updatedUser: User) => {
      if (updatedUser) {
        updateUser({
          ...updatedUser,
          avatarUrl: updatedUser.avatarUrl,
          avatar_url: updatedUser.avatarUrl,
        });
        queryClient.setQueryData(queryKeys.user.profile(), updatedUser);
        queryClient.setQueryData(queryKeys.user.details(), (prev: unknown) => {
          if (!prev || typeof prev !== 'object') return prev;
          return {
            ...prev,
            avatar_url: updatedUser.avatarUrl,
            avatarUrl: updatedUser.avatarUrl,
          };
        });
      }
      toast.success('Profile photo updated successfully!');
    },
    onError: (err: unknown) => {
      const apiError = err as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      const errorMsg =
        apiError.response?.data?.detail ??
        apiError.response?.data?.message ??
        apiError.message ??
        'Failed to upload profile photo. Please try again.';
      toast.error(errorMsg);
    },
  });
}
