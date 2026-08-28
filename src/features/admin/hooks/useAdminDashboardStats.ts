import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { AdminDashboardStatsResponse } from '@features/admin/types';
import { adminService } from '@services/admin/admin.service';

export function useAdminDashboardStats() {
  return useQuery<AdminDashboardStatsResponse>({
    queryKey: queryKeys.admin.dashboardStats(),
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 2,
  });
}
