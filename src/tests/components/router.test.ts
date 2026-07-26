import type { RouteObject } from 'react-router-dom';

import { router } from '@app/router';
import { ROUTES } from '@constants/routes';

function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Expected route to be defined');
  return value;
}

/**
 * `router/index.tsx` is declarative route configuration (layouts + `lazyPage()` leaves).
 * Fully rendering + navigating the whole app tree here would be brittle and low-value;
 * instead assert the resulting `router.routes` tree has the expected top-level groups
 * and that every app route path is registered exactly once, under an errorElement-guarded
 * top-level group.
 */
describe('router', () => {
  it('has four top-level route groups: public, guest-only, protected, and the catch-all', () => {
    expect(router.routes).toHaveLength(4);
  });

  it('guards the public, guest, and protected groups with an errorElement', () => {
    const routes: RouteObject[] = router.routes;
    const publicGroup = defined(routes[0]);
    const guestGroup = defined(routes[1]);
    const protectedGroup = defined(routes[2]);
    const catchAll = defined(routes[3]);

    expect(publicGroup.errorElement).toBeDefined();
    expect(guestGroup.errorElement).toBeDefined();
    expect(protectedGroup.errorElement).toBeDefined();
    expect(catchAll.errorElement).toBeUndefined();
  });

  it('renders HomeRedirect at the index of the public group', () => {
    const publicGroup = defined(router.routes[0]);

    expect(publicGroup.children).toHaveLength(1);
    expect(defined(publicGroup.children?.[0]).index).toBe(true);
  });

  it('nests every guest-only auth route under the AuthLayout child of the GuestRoute group', () => {
    const guestGroup = defined(router.routes[1]);
    const authLayoutRoute = defined(guestGroup.children?.[0]);
    const authPaths = authLayoutRoute.children?.map((route) => route.path);

    expect(authPaths).toEqual([
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.VERIFY_OTP,
      ROUTES.VERIFY_LOGIN,
      ROUTES.FORGOT_PASSWORD,
      ROUTES.RESET_PASSWORD,
    ]);
  });

  it('nests the pricing and dashboard route groups under the ProtectedRoute group', () => {
    const protectedGroup = defined(router.routes[2]);
    const pricingLayoutRoute = defined(protectedGroup.children?.[0]);
    const dashboardLayoutRoute = defined(protectedGroup.children?.[1]);

    expect(pricingLayoutRoute.children?.map((route) => route.path)).toEqual([ROUTES.PRICING]);
    expect(dashboardLayoutRoute.children?.map((route) => route.path)).toEqual([
      ROUTES.DASHBOARD,
      ROUTES.WORKSPACE,
      ROUTES.AI_CHAT,
      ROUTES.SETTINGS,
      ROUTES.PROFILE,
    ]);
  });

  it('falls back to a wildcard "*" route for unmatched paths', () => {
    const catchAll = defined(router.routes[router.routes.length - 1]);

    expect(catchAll.path).toBe('*');
  });
});
