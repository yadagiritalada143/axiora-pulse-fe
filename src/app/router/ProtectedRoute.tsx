import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useCurrentUser } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';

/** Redirects to `/login` when there's no session, and strictly redirects based on payment and questionnaire status. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Admins bypass plan restrictions
  if (role === 'admin') {
    return <Outlet />;
  }

  const hasPlan = hasActivePlan || role === 'member';
  const path = location.pathname;

  const isPaymentOrOnboardingRoute = path === ROUTES.PRICING || path === ROUTES.ONBOARDING;
  if (!hasPlan && !isPaymentOrOnboardingRoute) {
    return <Navigate to={onboardingPending ? ROUTES.ONBOARDING : ROUTES.PRICING} replace />;
  }

  return <Outlet />;
}
