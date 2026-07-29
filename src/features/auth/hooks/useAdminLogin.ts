import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { AdminLoginRequest } from '../types';

export function useAdminLogin() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setRole = useAuthStore((state) => state.setRole);

  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => authService.adminLogin(payload),

    onSuccess: (response) => {
      setAuthenticated(response.access_token, response.refresh_token);

      setRole(response.role);
      toast.success(response.message);
      void navigate(ROUTES.ADMIN_DASHBOARD);
    },

    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to sign in. Please try again.');
    },
  });
}
