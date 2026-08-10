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

      const rawUser = user as UserWithAuthActions;
      if (rawUser?.auth_actions) {
        const { payment, interactive_questions } = rawUser.auth_actions;
        useAuthStore.getState().setHasActivePlan(payment);
        useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
        useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);
      } else if (typeof rawUser?.hasActivePlan === 'boolean') {
        useAuthStore.getState().setHasActivePlan(rawUser.hasActivePlan);
      }

      return user;
    },
    enabled: isAuthenticated,
  });
}
