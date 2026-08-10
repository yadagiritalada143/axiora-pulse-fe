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

        if (response.auth_actions) {
          const { payment, interactive_questions } = response.auth_actions;
          useAuthStore.getState().setHasActivePlan(payment);
          useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
          useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);

          if (!payment) {
            void navigate(ROUTES.PRICING);
          } else if (!interactive_questions) {
            void navigate(ROUTES.QUESTIONNAIRE_INTRO);
          } else {
            void navigate(ROUTES.DASHBOARD);
          }
          return;
        }

        if (variables.flow === 'login') {
          const hasActivePlan = response.hasActivePlan ?? false;
          useAuthStore.getState().setHasActivePlan(hasActivePlan);
          if (hasActivePlan) {
            if (!useAuthStore.getState().hasCompletedQuestionnaire) {
              void navigate(ROUTES.QUESTIONNAIRE_INTRO);
            } else {
              void navigate(ROUTES.DASHBOARD);
            }
          } else {
            void navigate(ROUTES.PRICING);
          }
        } else {
          setOnboardingPending?.(true);
          void navigate(ROUTES.ONBOARDING);
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
