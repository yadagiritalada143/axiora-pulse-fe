import { Sparkles } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { appConfig } from '@config/app.config';
import { ROUTES } from '@constants/routes';

/** Layout for marketing/public pages (pricing, landing) that need a simple top nav. */
export function PublicLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="text-primary size-5" />
          {appConfig.name}
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
