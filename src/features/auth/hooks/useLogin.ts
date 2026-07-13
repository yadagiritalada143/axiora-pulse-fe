import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService, type LoginPayload } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      setSession(session);
      void navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to sign in. Please try again.');
    },
  });
}
