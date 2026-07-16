import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { VerifyForgotPasswordRequest } from '../types';

export function useVerifyForgotPassword() {
  const setResetToken = useAuthStore((state) => state.setResetToken);

  return useMutation({
    mutationFn: (payload: VerifyForgotPasswordRequest) => authService.verifyForgotPassword(payload),
    onSuccess: (response) => {
      setResetToken(response.reset_token);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Invalid or expired code. Please try again.');
    },
  });
}
