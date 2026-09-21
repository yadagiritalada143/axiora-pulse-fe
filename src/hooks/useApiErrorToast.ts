import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { ApiRequestError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';

export function useApiErrorToast() {
  const navigate = useNavigate();

  return useCallback(
    (error: unknown, fallback = 'Something went wrong. Please try again.') => {
      const apiError = error as ApiRequestError | undefined;
      const message = apiError?.message ?? fallback;

      if (apiError?.status === 402) {
        toast.error(message, {
          action: { label: 'Upgrade', onClick: () => void navigate(ROUTES.PRICING) },
        });
        return;
      }

      toast.error(message);
    },
    [navigate],
  );
}
