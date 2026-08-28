import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { RevenueAnalyticsPeriod, RevenueResponse } from '@features/admin/types';
import { adminService } from '@services/admin/admin.service';

export function useAdminAnalyticsRevenue(period: RevenueAnalyticsPeriod = 'month') {
  return useQuery<RevenueResponse>({
    queryKey: queryKeys.admin.analyticsRevenue(period),
    queryFn: () => adminService.getAnalyticsRevenue(period),
    staleTime: 1000 * 60 * 2,
  });
}
