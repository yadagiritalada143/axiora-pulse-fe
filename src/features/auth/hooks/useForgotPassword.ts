import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService, type ForgotPasswordPayload } from '@services/auth';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    onSuccess: () => {
      toast.success('If an account exists for that email, a reset link is on its way.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to send the reset link.');
    },
  });
}
