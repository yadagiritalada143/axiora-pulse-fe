import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';

/**
 * Select the free (Starter) plan. Creates the user's allowance row and starts
 * the 7-day trial clock server-side (idempotent — re-selecting never extends it).
 * Refreshes the cached account/subscription status on success so the profile
 * "Plan Details" view reflects the trial immediately.
 */
export function useSelectFreePlan() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (planId: string) => billingService.selectFreePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.status() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
}
