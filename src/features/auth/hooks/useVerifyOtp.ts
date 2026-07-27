import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { VerifyOtpRequest } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useVerifyOtp() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authService.verifyOTP(payload),

    onSuccess: (response) => {
      if (response.status === 'success') {
        setAuthenticated(response.access_token, response.refresh_token);
        setOnboardingPending(true);
        void navigate(ROUTES.DASHBOARD);
        return;
      }
      toast.error(response.message);
    },

    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'OTP verification failed.');
    },
  });
}
