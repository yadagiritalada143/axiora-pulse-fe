import { Navigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** `/` has no page of its own - routes to the right landing spot based on session state. */
export function HomeRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const role = useAuthStore((state) => state.role);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (onboardingPending) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  const hasPlan = hasActivePlan || role === 'member';
  return <Navigate to={hasPlan ? ROUTES.DASHBOARD : ROUTES.PRICING} replace />;
}
