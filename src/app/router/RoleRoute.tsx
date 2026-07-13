import { Navigate, Outlet } from 'react-router-dom';

import { roleAtLeast, type Role } from '@constants/roles';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** Gate for routes that require at least `minimumRole` (e.g. billing/admin screens). */
export function RoleRoute({ minimumRole }: { minimumRole: Role }) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roleAtLeast(user.role, minimumRole)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
