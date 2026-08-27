import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  AdminDashboardMetrics,
  AdminRecentUsersCard,
  AdminRevenueChart,
  AdminUserGrowthChart,
  AdminUsersByPlanChart,
} from '@features/admin/components';

jest.mock('@features/admin/hooks', () => ({
  useAdminUsers: jest.fn(() => ({
    data: {
      users: [
        {
          id: 1,
          username: 'john.doe@mail.com',
          display_name: 'John Doe',
          role: 'member',
          created_at: '2026-08-18T00:00:00Z',
          workspace_count: 3,
        },
      ],
      pagination: { total: 1, limit: 5, offset: 0 },
    },
    isLoading: false,
    isError: false,
  })),
  useAdminAnalyticsUserGrowth: jest.fn(() => ({
    data: {
      period: 'month',
      series: [
        { period: '2026-08-12', count: 100 },
        { period: '2026-08-13', count: 250 },
      ],
    },
    isLoading: false,
    isError: false,
  })),
  useAdminAnalyticsUsersByPlan: jest.fn(() => ({
    data: {
      total_users: 12000,
      plans: [
        { plan: 'pro', user_count: 5000, percentage: 41.7 },
        { plan: 'free', user_count: 7000, percentage: 58.3 },
      ],
    },
    isLoading: false,
    isError: false,
  })),
  useAdminAnalyticsRevenue: jest.fn(() => ({
    data: {
      period: 'month',
      total_amount: 15400.5,
      series: [{ period: '2026-08-01', amount: 500 }],
    },
    isLoading: false,
    isError: false,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('Admin Dashboard Components', () => {
  it('renders all 6 metric cards including Active & Archive Workspaces', () => {
    const mockStats = {
      total_users: 12583,
      paid_users: 4753,
      non_paid_users: 7830,
      active_subscriptions: 4218,
      total_workspaces: 9500,
      active_workspaces: 8200,
      archived_workspaces: 1300,
      growth: {
        total_users: 12.5,
        paid_users: 8.3,
        non_paid_users: 15.7,
        active_subscriptions: 10.2,
        total_workspaces: 6.0,
        active_workspaces: 7.4,
        archived_workspaces: -2.1,
      },
    };

    render(<AdminDashboardMetrics stats={mockStats} />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('12,583')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();

    expect(screen.getByText('Paid Users')).toBeInTheDocument();
    expect(screen.getByText('4,753')).toBeInTheDocument();
    expect(screen.getByText('+8.3%')).toBeInTheDocument();

    expect(screen.getByText('Non-Paid Users')).toBeInTheDocument();
    expect(screen.getByText('7,830')).toBeInTheDocument();

    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('4,218')).toBeInTheDocument();

    expect(screen.getByText('Active Workspaces')).toBeInTheDocument();
    expect(screen.getByText('8,200')).toBeInTheDocument();

    expect(screen.getByText('Archive Workspaces')).toBeInTheDocument();
    expect(screen.getByText('1,300')).toBeInTheDocument();
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
  });

  it('renders AdminUserGrowthChart with title and period controls', () => {
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });

    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('New user registrations over time')).toBeInTheDocument();
  });

  it('renders AdminUsersByPlanChart with total user count and plan items', () => {
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });

    expect(screen.getByText('Users by Plan')).toBeInTheDocument();
    expect(screen.getByText('12,000')).toBeInTheDocument();
    expect(screen.getAllByText('Pro Plan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Free Plan').length).toBeGreaterThanOrEqual(1);
  });

  it('renders AdminRecentUsersCard with clickable user row', () => {
    render(<AdminRecentUsersCard />, { wrapper: createWrapper() });

    expect(screen.getByText('Recent Users')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getAllByText('john.doe@mail.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pro Plan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /John Doe/i })).toBeInTheDocument();
  });

  it('renders AdminRevenueChart with formatted revenue total', () => {
    render(<AdminRevenueChart />, { wrapper: createWrapper() });

    expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    expect(screen.getByText(/₹15,400.50/)).toBeInTheDocument();
  });
});
