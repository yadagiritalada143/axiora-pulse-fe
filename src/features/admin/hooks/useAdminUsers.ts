import { useQuery } from '@tanstack/react-query';

import type { ListAdminUsersParams } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminUsers(params?: ListAdminUsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.listUsers(params),
  });
}
