import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';

export function usePricingPlans() {
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    queryFn: () => billingService.listPlans(),
  });
}
