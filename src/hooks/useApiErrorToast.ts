import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { ApiRequestError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';

/**
 * Toast an API error using the backend's own message, so plan/limit blocks read
 * clearly instead of a generic "failed, try again". When the failure is a plan/limit
 * block (HTTP 402), also surface an "Upgrade" action that routes to pricing.
 *
 * Usage:
 *   const showApiError = useApiErrorToast();
 *   mutate(vars, { onError: (err) => showApiError(err, 'Fallback message.') });
 */
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
