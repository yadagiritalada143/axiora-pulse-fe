import { useQuery } from '@tanstack/react-query';

import type { GrowthGranularity } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useUserGrowth(granularity: GrowthGranularity) {
  return useQuery({
    queryKey: queryKeys.admin.userGrowth(granularity),
    queryFn: () => adminService.getUserGrowth(granularity),
  });
}
