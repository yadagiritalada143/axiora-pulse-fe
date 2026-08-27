import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { UsersByPlanResponse } from '@features/admin/types';
import { adminService } from '@services/admin/admin.service';

export function useAdminAnalyticsUsersByPlan() {
  return useQuery<UsersByPlanResponse>({
    queryKey: queryKeys.admin.analyticsUsersByPlan(),
    queryFn: () => adminService.getAnalyticsUsersByPlan(),
    staleTime: 1000 * 60 * 2,
  });
}
