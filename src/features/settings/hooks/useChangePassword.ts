import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ChangePasswordRequest, ChangePasswordResponse } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';

import { userService } from '../api/user.service';

export function useChangePassword() {
  return useMutation<ChangePasswordResponse, unknown, ChangePasswordRequest>({
    mutationFn: (payload: ChangePasswordRequest) => userService.changePassword(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully.');
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : 'Failed to change password. Please check your current password.',
      );
    },
  });
}
