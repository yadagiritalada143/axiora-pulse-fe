import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { SetProfileStatusPayload } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
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
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
    onError: () => {
      toast.error('Failed to update user status.');
    },
  });
}
