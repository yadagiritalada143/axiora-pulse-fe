import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { GoogleLoginRequest } from '@/features/auth/types';
import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

/**
 * Authenticates a user from a Google Identity Services credential (ID token).
 * On success the backend returns the same token/gate shape as the OTP login
 * flow, so post-auth routing mirrors {@link useVerifyLogin}.
 */
export function useGoogleLogin() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);
  const setRole = useAuthStore((state) => state.setRole);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);

  return useMutation({
    mutationFn: (payload: GoogleLoginRequest) => authService.googleLogin(payload),
    onSuccess: (response) => {
      if (response.status !== 'success') {
        toast.error(response.message || 'Google sign-in failed.');
        return;
      }

      setAuthenticated(response.access_token, response.refresh_token);
      setRole(response.role);

      void authService
        .getCurrentUser()
        .then((user) => {
          useAuthStore.getState().updateUser(user);
          return user;
        })
        .catch(() => null);

      toast.success(response.message || 'Signed in with Google.');

      if (response.role === 'admin') {
        void navigate(ROUTES.ADMIN_DASHBOARD);
        return;
      }

      if (response.auth_actions) {
        const { payment, interactive_questions } = response.auth_actions;
        setHasActivePlan(payment);
        useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
        useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);
      }

      // A first-time Google account is a registration: route through onboarding
      // (welcome + guide video), exactly like the email/password signup flow.
      if (response.is_new_user) {
        setOnboardingPending?.(true);
        void navigate(ROUTES.ONBOARDING);
        return;
      }

      // Returning users: route by their post-login payment gate.
      if (response.auth_actions) {
        void navigate(response.auth_actions.payment ? ROUTES.DASHBOARD : ROUTES.PRICING);
        return;
      }

      setHasActivePlan(false);
      void navigate(ROUTES.PRICING);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Google sign-in failed. Please try again.');
    },
  });
}
