import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { VerifyOtpRequest } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useVerifyOtp() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setRole = useAuthStore((state) => state.setRole);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authService.verifyOTP(payload),

    onSuccess: (response, variables) => {
      if (response.status === 'success') {
        setAuthenticated(response.access_token, response.refresh_token);
        if (response.role) {
          setRole(response.role);
        }

        void authService
          .getCurrentUser()
          .then((user) => {
            useAuthStore.getState().updateUser(user);
            return user;
          })
          .catch(() => null);

        if (response.role === 'admin') {
          void navigate(ROUTES.ADMIN_DASHBOARD);
          return;
        }

        const isRegisterFlow = variables.flow !== 'login';
        const isMember = response.role === 'member';

        if (response.auth_actions) {
          const { payment, interactive_questions } = response.auth_actions;
          const hasPlan = payment || isMember;
          useAuthStore.getState().setHasActivePlan(hasPlan);
          useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
          useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);

          if (isRegisterFlow) {
            setOnboardingPending?.(true);
            void navigate(ROUTES.ONBOARDING);
          } else if (!hasPlan) {
            void navigate(ROUTES.PRICING);
          } else {
            void navigate(ROUTES.DASHBOARD);
          }
          return;
        }

        if (isRegisterFlow) {
          setOnboardingPending?.(true);
          void navigate(ROUTES.ONBOARDING);
        } else {
          const hasActivePlan = (response.hasActivePlan ?? false) || isMember;
          useAuthStore.getState().setHasActivePlan(hasActivePlan);
          if (hasActivePlan) {
            void navigate(ROUTES.DASHBOARD);
          } else {
            void navigate(ROUTES.PRICING);
          }
        }
        return;
      }
      toast.error(response.message);
    },

    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'OTP verification failed.');
    },
  });
}
