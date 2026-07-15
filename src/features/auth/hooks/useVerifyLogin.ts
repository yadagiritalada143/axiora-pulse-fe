import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { VerifyLoginRequest } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useVerifyLogin() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  return useMutation({
    mutationFn: (payload: VerifyLoginRequest) => authService.verifyLogin(payload),
    onSuccess: (response) => {
      if (response.status === 'success') {
        setAuthenticated(response.access_token, response.refresh_token);
        toast.success(response.message || 'Login successful.');
        void navigate(ROUTES.DASHBOARD);
        return;
      }
      toast.error(response.message);
    },

    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Login OTP verification failed.');
    },
  });
}
