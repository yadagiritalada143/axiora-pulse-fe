import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** Keeps authenticated users out of login/register/etc.
 *  Admins always land on /admin/dashboard, bypassing plan selection entirely.
 *  Otherwise redirects to /dashboard while onboarding is pending (so a freshly-verified
 *  register can't be bounced to /pricing before the onboarding modal shows),
 *  to /pricing if they haven't chosen a plan yet, or to /dashboard. */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const role = useAuthStore((state) => state.role);

  if (isAuthenticated) {
    const destination =
      role === 'admin'
        ? ROUTES.ADMIN_DASHBOARD
        : onboardingPending
          ? ROUTES.DASHBOARD
          : hasActivePlan
            ? ROUTES.DASHBOARD
            : ROUTES.PRICING;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
