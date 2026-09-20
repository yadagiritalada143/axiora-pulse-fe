import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { PricingPlan } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';

export function usePricingPlans(): UseQueryResult<PricingPlan[], Error> {
  return useQuery<PricingPlan[], Error>({
    queryKey: queryKeys.billing.plans(),
    queryFn: () => billingService.listPlans(),
  });
}
