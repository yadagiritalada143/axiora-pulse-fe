import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useAdminAnalyticsUsersByPlan } from '@features/admin/hooks';

const PLAN_COLORS: Record<string, string> = {
  free: '#FDBA74',
  pro: '#EA580C',
  starter: '#FB923C',
  team: '#C2410C',
  enterprise: '#9A3412',
};

const FALLBACK_COLORS = ['#EA580C', '#FB923C', '#FDBA74', '#C2410C', '#9A3412', '#FED7AA'];

function formatPlanName(plan: string): string {
  if (!plan) return 'Unknown Plan';
  return plan
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .concat(plan.toLowerCase().includes('plan') ? '' : ' Plan');
}

export function AdminUsersByPlanChart() {
  const { data, isLoading, isError, error } = useAdminAnalyticsUsersByPlan();

  const totalUsers = data?.total_users ?? 0;
  const plans = data?.plans ?? [];

  const chartData = plans.map((p, idx) => ({
    name: formatPlanName(p.plan),
    rawPlan: p.plan,
    value: p.user_count,
    percentage: p.percentage,
    color: PLAN_COLORS[p.plan.toLowerCase()] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
  }));

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-xs transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-lg font-bold">Users by Plan</CardTitle>
        <p className="text-muted-foreground text-xs">
          Distribution of users across subscription tiers
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <Loader label="Loading plan breakdown..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <ApiErrorMessage error={error} />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-[280px] items-center justify-center text-sm">
            No plan data available.
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="relative h-[210px] w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0 && payload[0]) {
                        const item = payload[0].payload as (typeof chartData)[0];
                        return (
                          <div className="border-border/80 bg-background/95 min-w-[130px] rounded-xl border p-2.5 shadow-lg backdrop-blur-md">
                            <p className="text-foreground text-xs font-semibold">{item.name}</p>
                            <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground font-mono">
                                {item.value.toLocaleString()} users
                              </span>
                              <span className="text-foreground font-bold">{item.percentage}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Total
                </span>
                <span className="text-foreground font-mono text-xl font-bold tracking-tight sm:text-2xl">
                  {totalUsers.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-border/50 mt-2 grid w-full grid-cols-2 gap-2 border-t pt-3">
              {chartData.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="bg-muted/40 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground truncate font-medium">{item.name}</span>
                  </div>
                  <span className="text-foreground shrink-0 pl-2 font-mono font-bold">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
