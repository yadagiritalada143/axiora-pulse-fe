import {
  Archive,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  User2Icon,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { ThemeToggle } from '@components/common/ThemeToggle';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ROUTES } from '@constants/routes';
import { useCurrentUser, useLogout } from '@features/auth/hooks';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';

export interface MentorNavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  end?: boolean;
  disabled?: boolean;
}

const WORKSPACE_NAV_ITEMS: MentorNavItem[] = [
  // { label: 'Founder Intelligence', icon: Users, disabled: true },
  // { label: 'Startup Intelligence', icon: TrendingUp, disabled: true },
  // { label: 'Documents & reports', icon: FileText, disabled: true },
  // { label: 'Risk Management', icon: ShieldCheck, disabled: true },
];

function getDisplayName(user?: { name?: string | null; email?: string | null } | null): string {
  const name = user?.name?.trim();
  if (name) return name;
  const emailPrefix = user?.email?.split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;
  return 'Account';
}

interface MentorShellProps {
  children: ReactNode;
  overviewItem?: MentorNavItem;
  navItems?: MentorNavItem[];
  navSectionLabel?: string;
  mainClassName?: string;
}

export function MentorShell({
  children,
  overviewItem,
  navItems = WORKSPACE_NAV_ITEMS,
  navSectionLabel = 'Workspace',
  mainClassName,
}: MentorShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const storeUser = useAuthStore((state) => state.user);
  const user = storeUser ?? currentUser;
  const displayName = getDisplayName(user);
  const role = useAuthStore((state) => state.role);
  const handleLogout = useLogout();

  const closeNav = () => setIsNavOpen(false);

  const isAdmin = role === 'admin' || user?.role === 'admin';

  const defaultOverviewItem: MentorNavItem = {
    label: 'Overview',
    icon: LayoutGrid,
    href: isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD,
    end: true,
  };

  const activeOverviewItem = overviewItem ?? defaultOverviewItem;

  const footerItems: MentorNavItem[] = [
    ...(isAdmin ? [] : [{ label: 'Archive', icon: Archive, href: ROUTES.WORKSPACE_ARCHIVE }]),
    // { label: 'Integrations', icon: Sparkles, disabled: true },
    { label: 'Settings', icon: Settings, href: ROUTES.SETTINGS },
    { label: 'Logout', icon: LogOut, onClick: () => void handleLogout() },
  ];

  return (
    <div className="bg-muted flex h-dvh w-full items-stretch justify-center overflow-hidden sm:p-3">
      <div className="bg-background border-border relative flex w-full overflow-hidden sm:rounded-2xl sm:border sm:shadow-sm">
        {isNavOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-hidden
            onClick={closeNav}
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
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeNav}
              className="text-muted-foreground hover:bg-accent flex size-8 items-center justify-center rounded-full transition-colors lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
            <MentorNavButton item={activeOverviewItem} onNavigate={closeNav} />

            {navItems.length > 0 ? (
              <>
                <p className="text-muted-foreground px-3 pt-4 pb-1 text-xs font-medium">
                  {navSectionLabel}
                </p>

                {navItems.map((item) => (
                  <MentorNavButton key={item.label} item={item} onNavigate={closeNav} />
                ))}
              </>
            ) : null}
          </nav>

          <div className="border-border space-y-1 border-t px-3 py-3">
            {footerItems.map((item) => (
              <MentorNavButton key={item.label} item={item} onNavigate={closeNav} />
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:h-16 sm:gap-4 sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsNavOpen(true)}
              className="text-muted-foreground hover:bg-accent flex size-9 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="hover:bg-accent flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {user?.name?.trim() ? (
                          user.name.trim().charAt(0).toUpperCase()
                        ) : user?.email?.trim() ? (
                          user.email.trim().charAt(0).toUpperCase()
                        ) : (
                          <User2Icon className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.PROFILE}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.SETTINGS}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => void handleLogout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8',
              mainClassName,
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function MentorNavButton({ item, onNavigate }: { item: MentorNavItem; onNavigate?: () => void }) {
  const Icon = item.icon;

  const baseClasses =
    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors';
  const idleClasses = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';
  const activeClasses = 'bg-primary/10 text-primary';

  if (item.href) {
    return (
      <NavLink
        to={item.href}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : idleClasses)}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  }

  if (item.disabled) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        className={cn(baseClasses, 'text-muted-foreground/50 cursor-not-allowed')}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
      className={cn(baseClasses, idleClasses)}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
    </button>
  );
}
