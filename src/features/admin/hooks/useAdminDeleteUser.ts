import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AdminUsersResponse } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => adminService.deleteUser(userId),
    onSuccess: (data, userId) => {
      toast.success(data.message || 'User permanently deleted.');

      queryClient.removeQueries({ queryKey: queryKeys.admin.userSurveySummary(userId) });

      queryClient.setQueriesData<AdminUsersResponse>(
        { queryKey: queryKeys.admin.users() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.filter((u) => u.id !== userId),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1),
            },
          };
        },
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboardStats() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete user.');
    },
  });
}
