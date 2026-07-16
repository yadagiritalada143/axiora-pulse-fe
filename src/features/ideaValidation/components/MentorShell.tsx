import {
  Bell,
  FileText,
  Info,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User2Icon,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { cn } from '@lib/utils';

interface MentorNavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

const WORKSPACE_NAV_ITEMS: MentorNavItem[] = [
  { label: 'AI Mentor', icon: Sparkles, active: true },
  { label: 'Founder Intelligence', icon: Users },
  { label: 'Startup Intelligence', icon: TrendingUp },
  { label: 'Documents & reports', icon: FileText },
  { label: 'Risk Management', icon: ShieldCheck },
];

const FOOTER_NAV_ITEMS: MentorNavItem[] = [
  { label: 'Integrations', icon: Sparkles },
  { label: 'Settings', icon: Settings },
  { label: 'Logout', icon: LogOut },
];

/**
 * Static app shell matching the AI Mentor design reference. Navigation,
 * search, and the survey/notification affordances are presentational only —
 * this screen is the one interactive piece (idea intake -> validation report).
 */
export function MentorShell({ children }: { children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="bg-muted flex h-dvh w-full items-stretch justify-center overflow-hidden sm:p-3">
      <div className="bg-background border-border relative flex w-full overflow-hidden sm:rounded-2xl sm:border sm:shadow-sm">
        {isNavOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-hidden
            onClick={() => setIsNavOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            'border-border bg-background fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r transition-transform duration-200 ease-out',
            'lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:transition-none',
            isNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <span className="text-foreground flex items-center text-lg font-semibold">
              Pulse
              <span className="bg-primary ml-0.5 size-1.5 rounded-full" aria-hidden />
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsNavOpen(false)}
              className="text-muted-foreground hover:bg-accent flex size-8 items-center justify-center rounded-full transition-colors lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
            <MentorNavButton
              item={{ label: 'Overview', icon: LayoutGrid }}
              onClick={() => setIsNavOpen(false)}
            />

            <p className="text-muted-foreground px-3 pt-4 pb-1 text-xs font-medium">Workspace</p>

            {WORKSPACE_NAV_ITEMS.map((item) => (
              <MentorNavButton key={item.label} item={item} onClick={() => setIsNavOpen(false)} />
            ))}
          </nav>

          <div className="border-border space-y-1 border-t px-3 py-3">
            {FOOTER_NAV_ITEMS.map((item) => (
              <MentorNavButton key={item.label} item={item} onClick={() => setIsNavOpen(false)} />
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:h-16 sm:gap-4 sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsNavOpen(true)}
              className="text-muted-foreground hover:bg-accent flex size-9 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            <div className="border-border text-muted-foreground hidden h-10 max-w-xs flex-1 items-center gap-2 rounded-lg border px-3 text-sm sm:flex">
              <Search className="size-4 shrink-0" aria-hidden />
              <span>Search anything.</span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
              <button
                type="button"
                aria-label="Survey"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors sm:px-4"
              >
                <span aria-hidden>+</span>
                <span className="hidden sm:inline">Survey</span>
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className="text-muted-foreground hover:bg-accent flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
              >
                <Bell className="size-4" />
              </button>

              <button
                type="button"
                aria-label="Help"
                className="text-muted-foreground hover:bg-accent hidden size-9 shrink-0 items-center justify-center rounded-full transition-colors sm:flex"
              >
                <Info className="size-4" />
              </button>

              <div className="flex items-center gap-2 pl-1">
                <Avatar className="size-8">
                  <AvatarFallback>
                    <User2Icon className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function MentorNavButton({ item, onClick }: { item: MentorNavItem; onClick?: () => void }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
        item.active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
    </button>
  );
}
