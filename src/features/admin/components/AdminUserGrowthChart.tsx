import { format, parseISO } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { useAdminAnalyticsUserGrowth } from '@features/admin/hooks';
import type { UserGrowthAnalyticsPeriod } from '@features/admin/types';

const PERIOD_LABELS: Record<UserGrowthAnalyticsPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  year: 'This Year',
};

function formatXAxis(period: string, activePeriod: UserGrowthAnalyticsPeriod): string {
  try {
    if (activePeriod === 'year') {
      const [y, m] = period.split('-');
      if (m) {
        return format(new Date(Number(y), Number(m) - 1, 1), 'MMM');
      }
      return period;
    }
    const parsed = parseISO(period);
    if (!isNaN(parsed.getTime())) {
      if (activePeriod === 'week' || activePeriod === 'last_7_days') {
        return format(parsed, 'EEE');
      }
      return format(parsed, 'd');
    }
  } catch {
    // fallback
  }
  return period;
}

function formatTooltipPeriod(period: string, activePeriod: UserGrowthAnalyticsPeriod): string {
  try {
    if (activePeriod === 'year') {
      const [y, m] = period.split('-');
      if (m) {
        return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy');
      }
      return period;
    }
    const parsed = parseISO(period);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'EEE, MMM d, yyyy');
    }
  } catch {
    // fallback
  }
  return period;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

export function AdminUserGrowthChart() {
  const [period, setPeriod] = useState<UserGrowthAnalyticsPeriod>('month');
  const { data, isLoading, isError, error } = useAdminAnalyticsUserGrowth(period);

  const series = useMemo(() => {
    return (data?.series ?? []).map((point) => ({
      ...point,
      xLabel: formatXAxis(point.period, period),
      tooltipLabel: formatTooltipPeriod(point.period, period),
    }));
  }, [data, period]);

  const totalGrowthUsers = useMemo(() => {
    return series.reduce((sum, item) => sum + item.count, 0);
  }, [series]);

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-xs transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground text-lg font-bold">User Growth</CardTitle>
            <span className="bg-primary/10 text-primary hidden items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex">
              <TrendingUp className="size-3" />
              {totalGrowthUsers.toLocaleString()} new
            </span>
          </div>
          <p className="text-muted-foreground text-xs">New user registrations over time</p>
        </div>

        <Select value={period} onValueChange={(val) => setPeriod(val as UserGrowthAnalyticsPeriod)}>
          <SelectTrigger className="border-border/80 bg-background h-8.5 w-[130px] rounded-lg text-xs font-medium shadow-xs">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent align="end" className="text-xs font-medium">
            <SelectItem value="week">{PERIOD_LABELS.week}</SelectItem>
            <SelectItem value="month">{PERIOD_LABELS.month}</SelectItem>
            <SelectItem value="last_7_days">{PERIOD_LABELS.last_7_days}</SelectItem>
            <SelectItem value="last_30_days">{PERIOD_LABELS.last_30_days}</SelectItem>
            <SelectItem value="year">{PERIOD_LABELS.year}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <Loader label="Loading user growth data..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <ApiErrorMessage error={error} />
          </div>
        ) : series.length === 0 ? (
          <div className="text-muted-foreground flex h-[280px] items-center justify-center text-sm">
            No registration data found for this period.
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminUserGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5722" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF5722" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/50"
                />
                <XAxis
                  dataKey="xLabel"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0]) {
                      const item = payload[0].payload as {
                        tooltipLabel: string;
                        count: number;
                      };
                      return (
                        <div className="border-border/80 bg-background/95 min-w-[140px] rounded-xl border p-2.5 shadow-lg backdrop-blur-md">
                          <p className="text-muted-foreground text-[11px] font-medium">
                            {item.tooltipLabel}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-3">
                            <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                              <span className="size-2 rounded-full bg-[#FF5722]" />
                              New Users
                            </span>
                            <span className="text-foreground font-mono text-sm font-bold">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#FF5722"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminUserGrowthGrad)"
                  activeDot={{
                    r: 5,
                    fill: '#FF5722',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
