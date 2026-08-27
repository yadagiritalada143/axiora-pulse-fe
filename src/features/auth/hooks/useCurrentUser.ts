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
      updateUser(user);

      const state = typeof useAuthStore.getState === 'function' ? useAuthStore.getState() : null;
      if (user.role && state?.setRole) {
        state.setRole(user.role);
      }

      const rawUser = user as UserWithAuthActions;
      if (rawUser?.auth_actions) {
        const { payment, interactive_questions } = rawUser.auth_actions;
        state?.setHasActivePlan?.(payment);
        state?.setHasCompletedQuestionnaire?.(interactive_questions);
        state?.setShowQuestionnaireIntro?.(!interactive_questions);
      } else if (typeof rawUser?.hasActivePlan === 'boolean') {
        state?.setHasActivePlan?.(rawUser.hasActivePlan);
      }

      return user;
    },
    enabled: isAuthenticated,
  });
}
