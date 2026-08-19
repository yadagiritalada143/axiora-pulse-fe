import { ArrowRight, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { UserGrowthChart } from '@features/admin/components';
import { useAuthStore } from '@store/auth.store';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back{user?.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage what users see across Axiora Pulse from here.
        </p>
      </div>

      <div className="border-border bg-primary/5 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <ListChecks className="size-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-foreground text-base font-semibold">Interactive Questions</p>
            <p className="text-muted-foreground text-sm">
              Add or remove the questions shown to users on their first login.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link to={ROUTES.ADMIN_INTERACTIVE_QUESTIONS}>
            Manage questions
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      <UserGrowthChart />
    </div>
  );
}
