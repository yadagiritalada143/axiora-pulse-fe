import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService, type ResetPasswordPayload } from '@services/auth';

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success('Password updated. Please sign in.');
      void navigate(ROUTES.LOGIN);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to reset your password.');
    },
  });
}
