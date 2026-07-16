import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** Keeps authenticated users out of login/register/etc.
 *  Redirects to /pricing if they haven't chosen a plan yet, otherwise /dashboard. */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);

  if (isAuthenticated) {
    return <Navigate to={hasActivePlan ? ROUTES.DASHBOARD : ROUTES.PRICING} replace />;
  }

  return <Outlet />;
}
