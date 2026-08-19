import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';

/** Current subscription status for the authenticated user. */
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => billingService.getSubscription(),
  });
}
