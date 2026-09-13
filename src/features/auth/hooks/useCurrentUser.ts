import { useQuery } from '@tanstack/react-query';

import type { User } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

interface UserWithAuthActions extends User {
  auth_actions?: {
    payment: boolean;
    interactive_questions: boolean;
  } | null;
  hasActivePlan?: boolean;
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery<User>({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const user = await authService.getCurrentUser();

      const firstName = (user.firstName ?? user.first_name)?.trim();
      const lastName = (user.lastName ?? user.last_name)?.trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      const profileStatus = user.profileStatus ?? user.profile_status;

      const normalizedUser: User = {
        ...user,
        ...(firstName ? { firstName, first_name: firstName } : {}),
        ...(lastName ? { lastName, last_name: lastName } : {}),
        ...(fullName ? { name: fullName } : {}),
        ...(profileStatus ? { profileStatus, profile_status: profileStatus } : {}),
      };

      updateUser(normalizedUser);

      const state = typeof useAuthStore.getState === 'function' ? useAuthStore.getState() : null;
      if (normalizedUser.role && state?.setRole) {
        state.setRole(normalizedUser.role);
      }

      const rawUser = normalizedUser as UserWithAuthActions;
      if (rawUser?.auth_actions) {
        const { payment, interactive_questions } = rawUser.auth_actions;
        state?.setHasActivePlan?.(payment);
        state?.setHasCompletedQuestionnaire?.(interactive_questions);
        state?.setShowQuestionnaireIntro?.(!interactive_questions);
      } else if (typeof rawUser?.hasActivePlan === 'boolean') {
        state?.setHasActivePlan?.(rawUser.hasActivePlan);
      }

      return normalizedUser;
    },
    enabled: isAuthenticated,
  });
}
