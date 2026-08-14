import { Link, Outlet, useLocation } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';

/** Layout for marketing/public pages (pricing, landing) that need a simple top nav. */
export function PublicLayout() {
  const location = useLocation();
  const isPublicSurvey = location.pathname.startsWith('/surveys/public/');

  if (isPublicSurvey) {
    return <Outlet />;
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <Link to={ROUTES.HOME} className="flex items-center">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.LOGIN}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.REGISTER}>Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
