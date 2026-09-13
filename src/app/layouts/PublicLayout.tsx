import { Link, Outlet, useLocation } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { ThemeToggle } from '@components/common/ThemeToggle';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';

export function PublicLayout() {
  const location = useLocation();
  const isPublicSurvey = location.pathname.startsWith('/surveys/public/');
  const isLandingPage = location.pathname === ROUTES.HOME || location.pathname === '/';
  const isLegalPage =
    location.pathname === ROUTES.PRIVACY_POLICY ||
    location.pathname === ROUTES.TERMS_OF_USE ||
    location.pathname === ROUTES.TERMS_AND_CONDITIONS;

  if (isPublicSurvey || isLandingPage || isLegalPage) {
    return <Outlet />;
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <Link to={ROUTES.HOME} className="flex items-center">
          <Logo />
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle />

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
