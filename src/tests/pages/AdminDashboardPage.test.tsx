import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AdminDashboardPage from '@pages/AdminDashboardPage';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/admin/hooks', () => ({
  useAdminDashboardStats: jest.fn(() => ({
    data: {
      total_users: 100,
      paid_users: 40,
      non_paid_users: 60,
      active_subscriptions: 35,
      total_workspaces: 80,
      active_workspaces: 70,
      archived_workspaces: 10,
      growth: {
        total_users: 12.5,
        paid_users: 8.3,
        non_paid_users: 15.7,
        active_subscriptions: 10.2,
        total_workspaces: 5.0,
        active_workspaces: 4.5,
        archived_workspaces: 1.2,
      },
    },
    isLoading: false,
  })),
  useAdminUsers: jest.fn(() => ({ data: { users: [] }, isLoading: false })),
  useAdminAnalyticsUserGrowth: jest.fn(() => ({ data: { series: [] }, isLoading: false })),
  useAdminAnalyticsUsersByPlan: jest.fn(() => ({ data: { plans: [] }, isLoading: false })),
  useAdminAnalyticsRevenue: jest.fn(() => ({ data: { series: [] }, isLoading: false })),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminDashboardPage', () => {
  afterEach(() => {
    act(() => {
      useAuthStore.setState({ user: null });
    });
  });

  it('greets the admin by name and renders headline overview', () => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Ada',
          avatarUrl: null,
          role: 'admin' as never,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    renderPage();

    expect(screen.getByRole('heading', { name: /welcome back, ada/i })).toBeInTheDocument();
    expect(
      screen.getByText(/overview of customer growth, subscriptions, workspaces/i),
    ).toBeInTheDocument();
  });
});
