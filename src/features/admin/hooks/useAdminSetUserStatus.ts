import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@constants/queryKeys';
import type { SetProfileStatusPayload } from '@features/admin/types';
import { adminService } from '@services/admin';

export function useAdminSetUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: SetProfileStatusPayload }) =>
      adminService.setUserStatus(userId, payload),
    onSuccess: (_, variables) => {
      toast.success('User status updated successfully.');
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userSurveySummary(variables.userId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user status.');
    },
  });
}
