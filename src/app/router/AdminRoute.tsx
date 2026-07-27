import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** Gate for `/admin/*` routes. Non-admins are bounced back to the user dashboard. */
export function AdminRoute() {
  const role = useAuthStore((state) => state.role);

  if (role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
