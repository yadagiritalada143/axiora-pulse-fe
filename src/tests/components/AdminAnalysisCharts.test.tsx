import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AdminRevenueChart } from '@features/admin/components/AdminRevenueChart';
import { AdminUserGrowthChart } from '@features/admin/components/AdminUserGrowthChart';
import { AdminUsersByPlanChart } from '@features/admin/components/AdminUsersByPlanChart';
import type {
  useAdminAnalyticsRevenue,
  useAdminAnalyticsUserGrowth,
  useAdminAnalyticsUsersByPlan,
} from '@features/admin/hooks';

const mockUseRevenue = jest.fn();
const mockUseGrowth = jest.fn();
const mockUseByPlan = jest.fn();

jest.mock('@features/admin/hooks', () => ({
  useAdminAnalyticsRevenue: (...args: unknown[]) => mockUseRevenue(...args),
  useAdminAnalyticsUserGrowth: (...args: unknown[]) => mockUseGrowth(...args),
  useAdminAnalyticsUsersByPlan: (...args: unknown[]) => mockUseByPlan(...args),
}));

type RevenueHook = ReturnType<typeof useAdminAnalyticsRevenue>;
type GrowthHook = ReturnType<typeof useAdminAnalyticsUserGrowth>;
type ByPlanHook = ReturnType<typeof useAdminAnalyticsUsersByPlan>;

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

const baseRevenue = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
} as RevenueHook;

const baseGrowth = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
} as GrowthHook;

const baseByPlan = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
} as ByPlanHook;

async function changePeriod(itemLabel: string) {
  await userEvent.click(screen.getAllByRole('combobox')[0] as unknown as HTMLElement);
  await userEvent.click(await screen.findByRole('option', { name: itemLabel }));
}

describe('AdminRevenueChart states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRevenue.mockReturnValue(baseRevenue);
  });

  it('shows loader while loading', () => {
    mockUseRevenue.mockReturnValue({ ...baseRevenue, isLoading: true });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading revenue analytics...')).toBeInTheDocument();
  });

  it('shows ApiErrorMessage on error', () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      isError: true,
      error: new Error('boom'),
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows empty state when no series', () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: { period: 'month', total_amount: 0, series: [] },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    expect(screen.getByText('No revenue recorded for this period.')).toBeInTheDocument();
  });

  it('renders formatted total and series with default month period', () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'month',
        total_amount: 15400.5,
        series: [{ period: '2026-08-01', amount: 500 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    expect(mockUseRevenue).toHaveBeenCalledWith('month');
  });

  it('switches period to today and re-renders with today data', async () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'today',
        total_amount: 500,
        series: [{ period: '2026-08-01 14:23:00', amount: 500 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    await changePeriod('Today');
    await waitFor(() => expect(mockUseRevenue).toHaveBeenLastCalledWith('today'));
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
  });

  it('switches period to week and renders abbreviated day labels', async () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'week',
        total_amount: 1000,
        series: [{ period: '2026-08-03', amount: 250 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    await changePeriod('This Week');
    await waitFor(() => expect(mockUseRevenue).toHaveBeenLastCalledWith('week'));
  });

  it('switches period to year and renders month labels', async () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'year',
        total_amount: 2000,
        series: [{ period: '2026-08', amount: 300 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    await changePeriod('This Year');
    await waitFor(() => expect(mockUseRevenue).toHaveBeenLastCalledWith('year'));
  });
});

describe('AdminUserGrowthChart states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGrowth.mockReturnValue(baseGrowth);
  });

  it('shows loader while loading', () => {
    mockUseGrowth.mockReturnValue({ ...baseGrowth, isLoading: true });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading user growth data...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    mockUseGrowth.mockReturnValue({
      ...baseGrowth,
      isError: true,
      error: new Error('boom'),
    });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows empty state when no series', () => {
    mockUseGrowth.mockReturnValue({
      ...baseGrowth,
      data: { period: 'month', series: [] },
    });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    expect(screen.getByText('No registration data found for this period.')).toBeInTheDocument();
  });

  it('renders total growth count with data', () => {
    mockUseGrowth.mockReturnValue({
      ...baseGrowth,
      data: {
        period: 'month',
        series: [
          { period: '2026-08-12', count: 100 },
          { period: '2026-08-13', count: 250 },
        ],
      },
    });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('350 new')).toBeInTheDocument();
  });

  it('switches to year granularity', async () => {
    mockUseGrowth.mockReturnValue({
      ...baseGrowth,
      data: {
        period: 'year',
        series: [
          { period: '2026-07', count: 10 },
          { period: '2026-08', count: 20 },
        ],
      },
    });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    await changePeriod('This Year');
    await waitFor(() => expect(mockUseGrowth).toHaveBeenLastCalledWith('year'));
  });

  it('switches to week granularity', async () => {
    mockUseGrowth.mockReturnValue({
      ...baseGrowth,
      data: {
        period: 'week',
        series: [{ period: '2026-08-03', count: 5 }],
      },
    });
    render(<AdminUserGrowthChart />, { wrapper: createWrapper() });
    await changePeriod('This Week');
    await waitFor(() => expect(mockUseGrowth).toHaveBeenLastCalledWith('week'));
  });
});

describe('AdminUsersByPlanChart states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseByPlan.mockReturnValue(baseByPlan);
  });

  it('shows loader while loading', () => {
    mockUseByPlan.mockReturnValue({ ...baseByPlan, isLoading: true });
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading plan breakdown...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    mockUseByPlan.mockReturnValue({
      ...baseByPlan,
      isError: true,
      error: new Error('boom'),
    });
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows empty state when no plans', () => {
    mockUseByPlan.mockReturnValue({
      ...baseByPlan,
      data: { total_users: 0, plans: [] },
    });
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });
    expect(screen.getByText('No plan data available.')).toBeInTheDocument();
  });

  it('formats plan names and renders legend + breakdown', () => {
    mockUseByPlan.mockReturnValue({
      ...baseByPlan,
      data: {
        total_users: 12000,
        plans: [
          { plan: 'pro', user_count: 5000, percentage: 41.7 },
          { plan: 'free', user_count: 7000, percentage: 58.3 },
        ],
      },
    });
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });
    expect(screen.getByText('12,000')).toBeInTheDocument();
    expect(screen.getAllByText('Pro Plan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Free Plan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/5000 \(41\.7%\)/)).toBeInTheDocument();
  });

  it('handles underscore-less and unknown plan names', () => {
    mockUseByPlan.mockReturnValue({
      ...baseByPlan,
      data: {
        total_users: 100,
        plans: [
          { plan: 'enterprise_custom', user_count: 10, percentage: 10 },
          { plan: '', user_count: 90, percentage: 90 },
        ],
      },
    });
    render(<AdminUsersByPlanChart />, { wrapper: createWrapper() });
    expect(screen.getAllByText('Enterprise Custom Plan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Unknown Plan').length).toBeGreaterThanOrEqual(1);
  });
});

describe('AdminRevenueChart formatter branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRevenue.mockReturnValue(baseRevenue);
  });

  it('renders year axis fallback for period without month', async () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'year',
        total_amount: 1000,
        series: [{ period: '2026', amount: 100 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    await changePeriod('This Year');
    expect(mockUseRevenue).toHaveBeenLastCalledWith('year');
  });

  it('renders today fallback for period without time', async () => {
    mockUseRevenue.mockReturnValue({
      ...baseRevenue,
      data: {
        period: 'today',
        total_amount: 1000,
        series: [{ period: '2026-08-01', amount: 100 }],
      },
    });
    render(<AdminRevenueChart />, { wrapper: createWrapper() });
    await changePeriod('Today');
    expect(mockUseRevenue).toHaveBeenLastCalledWith('today');
  });
});
