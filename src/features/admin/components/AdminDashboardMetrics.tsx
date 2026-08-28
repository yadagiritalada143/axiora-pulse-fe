import {
  Archive,
  CreditCard,
  Crown,
  FolderKanban,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import type { AdminDashboardGrowth, AdminDashboardStatsResponse } from '@features/admin/types';
import { cn } from '@lib/utils';

interface AdminDashboardMetricsProps {
  stats?: AdminDashboardStatsResponse;
  isLoading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  growth: number;
  icon: ReactNode;
  iconBg: string;
}

const DEFAULT_GROWTH: AdminDashboardGrowth = {
  total_users: 0,
  paid_users: 0,
  non_paid_users: 0,
  active_subscriptions: 0,
  total_workspaces: 0,
  active_workspaces: 0,
  archived_workspaces: 0,
};

function MetricCard({ title, value, growth, icon, iconBg }: MetricCardProps) {
  const isPositive = growth >= 0;
  const formattedGrowth = Math.abs(growth);

  return (
    <Card className="border-border/80 bg-card hover:border-primary/30 relative overflow-hidden rounded-xl shadow-xs transition-all duration-200 hover:shadow-md">
      <CardContent className="flex flex-col justify-between p-3.5 sm:p-4.5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105 sm:size-10',
              iconBg,
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] leading-tight font-semibold tracking-normal wrap-break-word whitespace-normal sm:text-xs">
              {title}
            </p>
            <p className="text-foreground mt-1 font-mono text-xl font-bold tracking-tight sm:text-2xl">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 pt-1 text-xs font-medium">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold sm:text-xs',
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3 shrink-0 stroke-[2.5]" />
            ) : (
              <TrendingDown className="size-3 shrink-0 stroke-[2.5]" />
            )}
            {isPositive ? `+${formattedGrowth}%` : `-${formattedGrowth}%`}
          </span>
          <span className="text-muted-foreground/80 text-[10px] sm:text-[11px]">
            vs last 7 days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card className="border-border/80 bg-card rounded-xl p-3.5 shadow-xs sm:p-4.5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 rounded-lg sm:size-10" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="mt-3 pt-1">
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

export function AdminDashboardMetrics({ stats, isLoading }: AdminDashboardMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  const growth: AdminDashboardGrowth = stats?.growth ?? DEFAULT_GROWTH;

  const totalUsers: number = stats?.total_users ?? 0;
  const paidUsers: number = stats?.paid_users ?? 0;
  const nonPaidUsers: number = stats?.non_paid_users ?? 0;
  const activeSubscriptions: number = stats?.active_subscriptions ?? 0;
  const activeWorkspaces: number = stats?.active_workspaces ?? 0;
  const archivedWorkspaces: number = stats?.archived_workspaces ?? 0;

  const metrics: MetricCardProps[] = [
    {
      title: 'Total Users',
      value: totalUsers,
      growth: growth.total_users,
      icon: <Users className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
    },
    {
      title: 'Paid Users',
      value: paidUsers,
      growth: growth.paid_users,
      icon: <Crown className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    },
    {
      title: 'Non-Paid Users',
      value: nonPaidUsers,
      growth: growth.non_paid_users,
      icon: <User className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      growth: growth.active_subscriptions,
      icon: <CreditCard className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
    },
    {
      title: 'Active Workspaces',
      value: activeWorkspaces,
      growth: growth.active_workspaces,
      icon: <FolderKanban className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white',
    },
    {
      title: 'Archive Workspaces',
      value: archivedWorkspaces,
      growth: growth.archived_workspaces,
      icon: <Archive className="size-4.5 text-white sm:size-5" />,
      iconBg: 'bg-gradient-to-br from-rose-500 to-purple-600 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
