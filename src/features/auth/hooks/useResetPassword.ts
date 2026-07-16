import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { ResetPasswordRequest } from '../types';

export function useResetPassword() {
  const navigate = useNavigate();
  const clearResetData = useAuthStore((state) => state.clearResetData);

  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
    onSuccess: () => {
      clearResetData();
      toast.success('Password updated successfully. Please sign in.');
      void navigate(ROUTES.LOGIN);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to reset your password.');
    },
  });
}
