import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
import { useAdminAnalyticsRevenue } from '@features/admin/hooks';
import type { RevenueAnalyticsPeriod, RevenueDataPoint } from '@features/admin/types';

const REVENUE_PERIOD_LABELS: Record<RevenueAnalyticsPeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
};

interface ChartRevenuePoint extends RevenueDataPoint {
  xLabel: string;
  tooltipLabel: string;
}

function formatRevenueXAxis(period: string, activePeriod: RevenueAnalyticsPeriod): string {
  try {
    if (activePeriod === 'today') {
      const timePart = period.split(' ')[1];
      return timePart ? timePart.slice(0, 5) : period;
    }
    if (activePeriod === 'year') {
      const [y, m] = period.split('-');
      if (m) {
        return format(new Date(Number(y), Number(m) - 1, 1), 'MMM');
      }
      return period;
    }
    const parsed = parseISO(period);
    if (!isNaN(parsed.getTime())) {
      if (activePeriod === 'week') {
        return format(parsed, 'EEE');
      }
      return format(parsed, 'd');
    }
  } catch {
    // fallback
  }
  return period;
}

function formatRevenueTooltipLabel(period: string, activePeriod: RevenueAnalyticsPeriod): string {
  try {
    if (activePeriod === 'today') {
      return period;
    }
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

function formatCurrencyAxis(value: number): string {
  if (value >= 100_000) return `₹${(value / 1000).toFixed(0)}k`;
  if (value >= 1_000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export function AdminRevenueChart() {
  const [period, setPeriod] = useState<RevenueAnalyticsPeriod>('month');
  const { data, isLoading, isError, error } = useAdminAnalyticsRevenue(period);

  const series = useMemo<ChartRevenuePoint[]>(() => {
    const rawPoints = data?.series ?? [];
    return rawPoints.map((point) => ({
      ...point,
      xLabel: formatRevenueXAxis(point.period, period),
      tooltipLabel: formatRevenueTooltipLabel(point.period, period),
    }));
  }, [data, period]);

  const totalAmount = data?.total_amount ?? 0;

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-xs transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground text-lg font-bold">Revenue Overview</CardTitle>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Aggregated successful subscription payments
          </p>
        </div>

        <Select value={period} onValueChange={(val) => setPeriod(val as RevenueAnalyticsPeriod)}>
          <SelectTrigger className="border-border/80 bg-background h-8.5 w-32.5 rounded-lg text-xs font-medium shadow-xs">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent align="end" className="text-xs font-medium">
            <SelectItem value="today">{REVENUE_PERIOD_LABELS.today}</SelectItem>
            <SelectItem value="week">{REVENUE_PERIOD_LABELS.week}</SelectItem>
            <SelectItem value="month">{REVENUE_PERIOD_LABELS.month}</SelectItem>
            <SelectItem value="year">{REVENUE_PERIOD_LABELS.year}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader label="Loading revenue analytics..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <ApiErrorMessage error={error} />
          </div>
        ) : series.length === 0 ? (
          <div className="text-muted-foreground flex h-60 items-center justify-center text-sm">
            No revenue recorded for this period.
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  tickFormatter={formatCurrencyAxis}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0]) {
                      const item = payload[0].payload as ChartRevenuePoint;
                      return (
                        <div className="border-border/80 bg-background/95 min-w-35 rounded-xl border p-2.5 shadow-lg backdrop-blur-md">
                          <p className="text-muted-foreground text-[11px] font-medium">
                            {item.tooltipLabel}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-3">
                            <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                              <span className="size-2 rounded-full bg-[#FB923C]" />
                              Revenue
                            </span>
                            <span className="text-foreground font-mono text-sm font-bold">
                              ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="#FB923C" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
