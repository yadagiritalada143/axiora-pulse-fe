import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { Button } from '@components/ui/button';
import { useLogout } from '@features/auth/hooks';

export function PricingLayout() {
  const handleLogout = useLogout();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* ── Slim header ── */}
      <header className="border-border flex h-16 shrink-0 items-center justify-between border-b px-6">
        <Logo />

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
