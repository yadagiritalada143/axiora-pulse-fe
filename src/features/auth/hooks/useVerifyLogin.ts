import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { VerifyLoginRequest } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useVerifyLogin() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);
  const setRole = useAuthStore((state) => state.setRole);

  return useMutation({
    mutationFn: (payload: VerifyLoginRequest) => authService.verifyLogin(payload),
    onSuccess: (response) => {
      if (response.status === 'success') {
        setAuthenticated(response.access_token, response.refresh_token);
        setRole(response.role);

        void authService
          .getCurrentUser()
          .then((user) => {
            useAuthStore.getState().updateUser(user);
            return user;
          })
          .catch(() => null);

        toast.success(response.message || 'Login successful.');

        if (response.role === 'admin') {
          void navigate(ROUTES.ADMIN_DASHBOARD);
          return;
        }

        if (response.auth_actions) {
          const { payment, interactive_questions } = response.auth_actions;
          setHasActivePlan(payment);
          useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
          useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);

          if (payment) {
            void navigate(ROUTES.DASHBOARD);
          } else {
            void navigate(ROUTES.PRICING);
          }
          return;
        }

        const hasActivePlan = response.hasActivePlan ?? false;
        setHasActivePlan(hasActivePlan);
        if (hasActivePlan) {
          void navigate(ROUTES.DASHBOARD);
        } else {
          void navigate(ROUTES.PRICING);
        }
        return;
      }
      toast.error(response.message);
    },

    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Login OTP verification failed.');
    },
  });
}
