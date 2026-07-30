import { useQuery } from '@tanstack/react-query';

import type { User } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery<User>({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      updateUser(user);
      return user;
    },
    enabled: isAuthenticated,
  });
}
