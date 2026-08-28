import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

import type { LoginRequest } from '../types';

export function useLogin() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);
  const setRole = useAuthStore((state) => state.setRole);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (response) => {
      if (response.status !== 'success') {
        toast.error(response.message || 'Login failed.');
        return;
      }

      setAuthenticated(response.access_token, response.refresh_token);
      setRole(response.role ?? 'viewer');

      void authService
        .getCurrentUser()
        .then((user) => {
          useAuthStore.getState().updateUser(user);
          return user;
        })
        .catch(() => null);

      toast.success(response.message || 'Signed in successfully.');

      if (response.role === 'admin') {
        void navigate(ROUTES.ADMIN_DASHBOARD);
        return;
      }

      const isMember = response.role === 'member';

      if (response.auth_actions) {
        const { payment, interactive_questions } = response.auth_actions;
        const hasPlan = payment || isMember;
        setHasActivePlan(hasPlan);
        useAuthStore.getState().setHasCompletedQuestionnaire(interactive_questions);
        useAuthStore.getState().setShowQuestionnaireIntro(!interactive_questions);

        if (hasPlan) {
          void navigate(ROUTES.DASHBOARD);
        } else {
          void navigate(ROUTES.PRICING);
        }
        return;
      }

      setHasActivePlan(isMember);
      void navigate(isMember ? ROUTES.DASHBOARD : ROUTES.PRICING);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to sign in. Please try again.');
    },
  });
}
