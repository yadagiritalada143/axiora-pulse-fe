import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { GrowthGranularity } from '@features/admin/types';
import { adminService } from '@services/admin';

export function useUserGrowth(granularity: GrowthGranularity) {
  return useQuery({
    queryKey: queryKeys.admin.userGrowth(granularity),
    queryFn: () => adminService.getUserGrowth(granularity),
  });
}
