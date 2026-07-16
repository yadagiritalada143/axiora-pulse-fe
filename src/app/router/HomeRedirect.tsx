import { Navigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** `/` has no page of its own - routes to the right landing spot based on session state. */
export function HomeRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Navigate to={hasActivePlan ? ROUTES.DASHBOARD : ROUTES.PRICING} replace />;
}
