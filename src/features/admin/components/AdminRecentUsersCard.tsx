import { format, parseISO } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { buildAdminUserDetailRoute, ROUTES } from '@constants/routes';
import { useAdminUsers } from '@features/admin/hooks';
import { cn } from '@lib/utils';

const AVATAR_COLORS = [
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
];

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    if (first && second) {
      return (first + second).toUpperCase();
    }
    return (parts[0] ?? '').slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function formatJoinDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'MMM d, yyyy');
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function getRoleBadge(role: string) {
  const normalized = role.toLowerCase();
  if (normalized === 'admin' || normalized === 'owner') {
    return (
      <Badge
        variant="outline"
        className="border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-700 uppercase dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
      >
        Admin
      </Badge>
    );
  }
  if (normalized === 'member' || normalized === 'pro') {
    return (
      <Badge
        variant="outline"
        className="border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-700 uppercase dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
      >
        Pro Plan
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-sky-700 uppercase dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
    >
      Free Plan
    </Badge>
  );
}

export function AdminRecentUsersCard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useAdminUsers({ limit: 5, offset: 0 });

  const users = data?.users ?? [];

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-xs transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-foreground text-lg font-bold">Recent Users</CardTitle>
          <p className="text-muted-foreground text-xs">
            Latest customer registrations across the platform
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:text-primary gap-1 text-xs font-semibold"
        >
          <Link to={ROUTES.ADMIN_USERS}>
            View All
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ApiErrorMessage error={error} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground flex h-[240px] items-center justify-center p-6 text-sm">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border/60 bg-muted/30 text-muted-foreground border-y text-[11px] font-semibold tracking-wider uppercase">
                <tr>
                  <th className="py-3 pr-4 pl-6">User</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="hidden px-4 py-3 md:table-cell">Joined On</th>
                  <th className="py-3 pr-6 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {users.map((u, idx) => {
                  const initials = getInitials(u.display_name, u.username);
                  const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <tr
                      key={u.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => {
                        void navigate(buildAdminUserDetailRoute(u.id));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          void navigate(buildAdminUserDetailRoute(u.id));
                        }
                      }}
                      className="hover:bg-muted/40 focus-visible:bg-muted/50 group cursor-pointer transition-colors duration-150 focus-visible:outline-none"
                    >
                      <td className="py-3.5 pr-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8.5 shrink-0 shadow-xs">
                            <AvatarFallback className={cn('text-xs font-bold', colorClass)}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-foreground group-hover:text-primary truncate font-semibold transition-colors">
                              {u.display_name || u.username.split('@')[0]}
                            </p>
                            <p className="text-muted-foreground truncate text-[11px] sm:hidden">
                              {u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="text-muted-foreground hidden max-w-[180px] truncate px-4 py-3.5 sm:table-cell">
                        {u.username}
                      </td>

                      <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>

                      <td className="text-muted-foreground hidden px-4 py-3.5 font-mono md:table-cell">
                        {formatJoinDate(u.created_at)}
                      </td>

                      <td className="py-3.5 pr-6 pl-4 text-right">
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
