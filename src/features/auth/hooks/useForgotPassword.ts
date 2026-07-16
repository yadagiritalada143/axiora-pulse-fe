import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { ForgotPasswordRequest } from '../types';

export function useForgotPassword() {
  const setResetEmailOrMobile = useAuthStore((state) => state.setResetEmailOrMobile);

  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
    onSuccess: (_response, variables) => {
      setResetEmailOrMobile(variables.emailOrMobile);
      toast.success('Password reset code has been sent.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to send the reset code.');
    },
  });
}
