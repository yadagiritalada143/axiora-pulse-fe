import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { LoginRequest } from '../types';

export function useLogin() {
  const navigate = useNavigate();
  const setMfaData = useAuthStore((state) => state.setMfaData);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (response, variables) => {
      setMfaData({
        userid: response.userid ?? 0,
        username: variables.username,
        identifier: variables.username,
        mfaVerified: false,
        flow: 'login',
      });
      toast.success('OTP sent successfully.');
      void navigate(ROUTES.VERIFY_LOGIN);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to sign in. Please try again.');
    },
  });
}
