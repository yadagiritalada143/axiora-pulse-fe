import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { RegisterRequest } from '../types';

export function useRegister() {
  const navigate = useNavigate();
  const setMfaData = useAuthStore((state) => state.setMfaData);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: (response, variables) => {
      setMfaData({
        userid: response.userid,
        username: response.username,
        identifier: variables.username,
        mfaVerified: false,
        flow: 'register',
      });
      toast.success('OTP sent successfully.');
      void navigate(ROUTES.VERIFY_OTP);
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : 'Unable to create account. Please try again.',
      );
    },
  });
}
