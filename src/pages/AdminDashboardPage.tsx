import {
  AdminDashboardMetrics,
  AdminRecentUsersCard,
  AdminRevenueChart,
  AdminUserGrowthChart,
  AdminUsersByPlanChart,
} from '@features/admin/components';
import { useAdminDashboardStats } from '@features/admin/hooks';
import { useAuthStore } from '@store/auth.store';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of customer growth, subscriptions, workspaces, and platform metrics.
        </p>
      </div>

      <section aria-label="Headline Metrics">
        <AdminDashboardMetrics stats={stats} isLoading={isStatsLoading} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AdminUserGrowthChart />
        </div>
        <div className="lg:col-span-5">
          <AdminUsersByPlanChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AdminRecentUsersCard />
        </div>
        <div className="lg:col-span-5">
          <AdminRevenueChart />
        </div>
      </div>
    </div>
  );
}
