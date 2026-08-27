import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useUserGrowth } from '@features/admin/hooks';
import type { GrowthGranularity, UserGrowthPoint } from '@features/admin/types';

const chartConfig = {
  count: {
    label: 'New users',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function periodToDate(period: string): Date {
  const [year, month] = period.split('-');
  return new Date(Number(year), month ? Number(month) - 1 : 0, 1);
}

function formatAxisLabel(period: string, granularity: GrowthGranularity): string {
  if (granularity === 'year') return period;
  return format(periodToDate(period), "MMM ''yy");
}

function formatTooltipLabel(period: string, granularity: GrowthGranularity): string {
  if (granularity === 'year') return period;
  return format(periodToDate(period), 'MMMM yyyy');
}

interface ChartRow extends UserGrowthPoint {
  label: string;
}

export function UserGrowthChart() {
  const [granularity, setGranularity] = useState<GrowthGranularity>('month');
  const { data, isLoading, isError, error } = useUserGrowth(granularity);

  const rows = useMemo<ChartRow[]>(
    () =>
      (data?.series ?? []).map((point) => ({
        ...point,
        label: formatAxisLabel(point.period, granularity),
      })),
    [data, granularity],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <TrendingUp className="size-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">User growth</CardTitle>
            <p className="text-muted-foreground text-sm">New user registrations over time.</p>
          </div>
        </div>
        <Tabs
          value={granularity}
          onValueChange={(value) => setGranularity(value as GrowthGranularity)}
          className="shrink-0"
        >
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader label="Loading chart" />
          </div>
        ) : isError ? (
          <ApiErrorMessage error={error} />
        ) : rows.length === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
            No user registrations yet.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={rows}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const first = Array.isArray(payload)
                        ? (payload[0] as { payload?: ChartRow } | undefined)
                        : undefined;
                      const row = first?.payload;
                      return row ? formatTooltipLabel(row.period, granularity) : '';
                    }}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
