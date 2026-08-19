import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { UserGrowthResponse } from '@/types/admin.types';
import { UserGrowthChart } from '@features/admin/components/UserGrowthChart';
import { useUserGrowth } from '@features/admin/hooks';

jest.mock('@features/admin/hooks', () => ({
  useUserGrowth: jest.fn(),
}));

const mockedUseUserGrowth = jest.mocked(useUserGrowth);

type HookResult = ReturnType<typeof useUserGrowth>;

function mockHook(overrides: Partial<HookResult>): void {
  mockedUseUserGrowth.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as HookResult);
}

describe('UserGrowthChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching', () => {
    mockHook({ isLoading: true });

    render(<UserGrowthChart />);

    expect(screen.getByText('Loading chart')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    mockHook({ isError: true, error: new Error('boom') });

    render(<UserGrowthChart />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an empty state when there are no registrations', () => {
    const data: UserGrowthResponse = { granularity: 'month', series: [] };
    mockHook({ data });

    render(<UserGrowthChart />);

    expect(screen.getByText('No user registrations yet.')).toBeInTheDocument();
  });

  it('renders the chart when data is present', () => {
    const data: UserGrowthResponse = {
      granularity: 'month',
      series: [
        { period: '2026-07', count: 2 },
        { period: '2026-08', count: 5 },
      ],
    };
    mockHook({ data });

    const { container } = render(<UserGrowthChart />);

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });

  it('defaults to month granularity and switches to year on toggle', async () => {
    const data: UserGrowthResponse = { granularity: 'month', series: [] };
    mockHook({ data });

    render(<UserGrowthChart />);

    expect(mockedUseUserGrowth).toHaveBeenCalledWith('month');

    await userEvent.click(screen.getByRole('tab', { name: 'Year' }));

    expect(mockedUseUserGrowth).toHaveBeenLastCalledWith('year');
  });
});
