import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { ListAdminUsersParams } from '@features/admin/types';
import { adminService } from '@services/admin';

export function useAdminUsers(params?: ListAdminUsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.listUsers(params),
  });
}
