import type { RouteObject } from 'react-router-dom';

import { router } from '@app/router';
import { ROUTES } from '@constants/routes';

function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Expected route to be defined');
  return value;
}

function findRoute(routes: RouteObject[] | undefined, path: string): RouteObject | undefined {
  for (const route of routes ?? []) {
    if (route.path === path) {
      return route;
    }

    const nestedRoute = findRoute(route.children, path);

    if (nestedRoute) {
      return nestedRoute;
    }
  }

  return undefined;
}

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

    expect(publicGroup.children).toHaveLength(2);
    expect(defined(publicGroup.children?.[0]).index).toBe(true);
  });

  it('nests every guest-only auth route under the AuthLayout child of the GuestRoute group', () => {
    const guestGroup = defined(router.routes[1]);
    const authLayoutRoute = defined(guestGroup.children?.[0]);

    const authPaths = authLayoutRoute.children?.map((route) => route.path);

    expect(authPaths).toEqual([
      ROUTES.LOGIN,
      ROUTES.ADMIN_LOGIN,
      ROUTES.REGISTER,
      ROUTES.VERIFY_OTP,
      ROUTES.VERIFY_LOGIN,
      ROUTES.FORGOT_PASSWORD,
      ROUTES.RESET_PASSWORD,
    ]);
  });

  it('registers all guest-only auth routes under AuthLayout', () => {
    const guestGroup = defined(router.routes[1]);
    const authLayoutRoute = defined(guestGroup.children?.[0]);

    const authPaths = authLayoutRoute.children?.map((route) => route.path);

    expect(authPaths).toEqual(
      expect.arrayContaining([
        ROUTES.LOGIN,
        ROUTES.ADMIN_LOGIN,
        ROUTES.REGISTER,
        ROUTES.VERIFY_OTP,
        ROUTES.VERIFY_LOGIN,
        ROUTES.FORGOT_PASSWORD,
        ROUTES.RESET_PASSWORD,
      ]),
    );

    expect(authPaths).toHaveLength(7);
  });

  it('registers dashboard routes under the protected route group', () => {
    const protectedGroup = defined(router.routes[2]);

    expect(findRoute(protectedGroup.children, ROUTES.DASHBOARD)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.WORKSPACE)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.AI_CHAT)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.SETTINGS)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.PROFILE)).toBeDefined();
  });

  it('registers the onboarding, questionnaire-intro, and interactive-questions routes under the protected group', () => {
    const protectedGroup = defined(router.routes[2]);

    expect(findRoute(protectedGroup.children, ROUTES.ONBOARDING)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.QUESTIONNAIRE_INTRO)).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.INTERACTIVE_QUESTIONS)).toBeDefined();
  });

  it('gates the admin routes behind AdminRoute, nested under AdminDashboardLayout', () => {
    const protectedGroup = defined(router.routes[2]);
    const adminRouteGroup = protectedGroup.children?.find((route) =>
      findRoute(route.children, ROUTES.ADMIN_DASHBOARD),
    );

    expect(adminRouteGroup).toBeDefined();
    expect(adminRouteGroup?.element).toBeDefined();

    const adminLayoutRoute = defined(adminRouteGroup?.children?.[0]);
    const adminPaths = adminLayoutRoute.children?.map((route) => route.path);

    expect(adminPaths).toEqual([
      ROUTES.ADMIN_DASHBOARD,
      ROUTES.ADMIN_INTERACTIVE_QUESTIONS,
      ROUTES.ADMIN_USERS,
    ]);
  });

  it('registers the admin login route as a guest-only route, not under AdminRoute', () => {
    const guestGroup = defined(router.routes[1]);
    const authLayoutRoute = defined(guestGroup.children?.[0]);

    expect(findRoute(authLayoutRoute.children, ROUTES.ADMIN_LOGIN)).toBeDefined();
  });

  it('registers survey intelligence routes', () => {
    const publicGroup = defined(router.routes[0]);
    const protectedGroup = defined(router.routes[2]);

    expect(findRoute(publicGroup.children, '/surveys/public/:surveyId')).toBeDefined();
    expect(findRoute(protectedGroup.children, ROUTES.WORKSPACE_SURVEY)).toBeDefined();
  });

  it('falls back to a wildcard "*" route for unmatched paths', () => {
    const catchAll = defined(router.routes[router.routes.length - 1]);

    expect(catchAll.path).toBe('*');
  });
});
