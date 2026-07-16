import { LogOut, Sparkles } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { appConfig } from '@config/app.config';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

export function PricingLayout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    // Fire-and-forget — clear session even if the API call fails
    void authService.logout().catch(() => null);
    clearSession();
    void navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* ── Slim header ── */}
      <header className="border-border flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="text-primary size-5" />
          <span>{appConfig.name}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </header>

      {/* ── Page content ── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
