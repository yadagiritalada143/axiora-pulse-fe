import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const role = useAuthStore((state) => state.role);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (onboardingPending) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return <Navigate to={hasActivePlan ? ROUTES.DASHBOARD : ROUTES.PRICING} replace />;
}
