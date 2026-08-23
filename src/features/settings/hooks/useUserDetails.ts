import { useQuery } from '@tanstack/react-query';

import type { UserDetails } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { useAuthStore } from '@store/auth.store';

import { userService } from '../api/user.service';

export function useUserDetails() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<UserDetails>({
    queryKey: queryKeys.user.details(),
    queryFn: () => userService.getUserDetails(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
