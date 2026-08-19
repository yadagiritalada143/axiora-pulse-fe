import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { ResendOtpRequest } from '../types';

export function useResendOtp() {
  const mfaData = useAuthStore((state) => state.mfaData);

  return useMutation({
    mutationFn: async () => {
      if (!mfaData) {
        throw new Error('OTP session has expired. Please sign in again.');
      }

      const payload: ResendOtpRequest = {
        flow: mfaData.flow,
      };

      if (mfaData.userid && mfaData.userid > 0) {
        payload.id = mfaData.userid;
      }

      const email = mfaData.identifier || mfaData.username;
      if (email) {
        payload.emailOrMobile = email;
      }

      return authService.resendOTP(payload);
    },

    onSuccess: (response) => {
      toast.success(`OTP has been sent to ${response.username}.`);
    },

    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to resend OTP.',
      );
    },
  });
}
