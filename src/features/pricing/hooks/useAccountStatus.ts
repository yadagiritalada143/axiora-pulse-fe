import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { AccountStatus } from '@/types/billing.types';
import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';

export function useAccountStatus(): UseQueryResult<AccountStatus, Error> {
  return useQuery<AccountStatus, Error>({
    queryKey: queryKeys.billing.status(),
    queryFn: () => billingService.getStatus(),
    staleTime: 1000 * 60 * 2,
  });
}
