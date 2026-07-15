import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService } from '@services/auth';

import type { ForgotPasswordRequest } from '../types';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
    onSuccess: () => {
      toast.success('If an account exists for that email, a reset link is on its way.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to send the reset link.');
    },
  });
}
