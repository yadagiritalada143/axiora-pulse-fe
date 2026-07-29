import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const role = useAuthStore((state) => state.role);

  if (isAuthenticated) {
    const destination =
      role === 'admin' ? ROUTES.ADMIN_DASHBOARD : hasActivePlan ? ROUTES.DASHBOARD : ROUTES.PRICING;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
