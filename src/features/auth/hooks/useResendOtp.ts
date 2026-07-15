import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useResendOtp() {
  const mfaData = useAuthStore((state) => state.mfaData);

  return useMutation({
    mutationFn: async () => {
      if (!mfaData) {
        throw new Error('OTP session has expired. Please login again.');
      }

      return authService.resendOTP({
        id: mfaData.userid,
        flow: mfaData.flow,
      });
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
