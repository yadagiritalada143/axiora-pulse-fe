import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminUserSurveySummary(userId: number) {
  return useQuery({
    queryKey: queryKeys.admin.userSurveySummary(userId),
    queryFn: () => adminService.getUserSurveySummary(userId),
    enabled: Number.isInteger(userId) && userId > 0,
  });
}
