import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService, type RegisterPayload } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (session) => {
      setSession(session);
      void navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create your account.');
    },
  });
}
