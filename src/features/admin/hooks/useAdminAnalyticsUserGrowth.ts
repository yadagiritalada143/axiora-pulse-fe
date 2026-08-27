import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { UserGrowthAnalyticsPeriod, UserGrowthAnalyticsResponse } from '@features/admin/types';
import { adminService } from '@services/admin/admin.service';

export function useAdminAnalyticsUserGrowth(period: UserGrowthAnalyticsPeriod = 'month') {
  return useQuery<UserGrowthAnalyticsResponse>({
    queryKey: queryKeys.admin.analyticsUserGrowth(period),
    queryFn: () => adminService.getAnalyticsUserGrowth(period),
    staleTime: 1000 * 60 * 2,
  });
}
