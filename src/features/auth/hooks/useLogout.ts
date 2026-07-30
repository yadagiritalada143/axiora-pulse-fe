import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  return async () => {
    try {
      await authService.logout();
    } catch {
      // Session clear runs regardless of backend network failure
    } finally {
      clearSession();
      void navigate(ROUTES.LOGIN, { replace: true });
    }
  };
}
