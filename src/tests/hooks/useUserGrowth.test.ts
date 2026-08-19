import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { UserGrowthResponse } from '@/types/admin.types';
import { useUserGrowth } from '@features/admin/hooks/useUserGrowth';
import { adminService } from '@services/admin';

jest.mock('@services/admin', () => ({
  adminService: {
    getUserGrowth: jest.fn(),
  },
}));

const mockedAdminService = jest.mocked(adminService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useUserGrowth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user growth for the given granularity', async () => {
    const mockData: UserGrowthResponse = {
      granularity: 'month',
      series: [
        { period: '2026-07', count: 2 },
        { period: '2026-08', count: 4 },
      ],
    };

    mockedAdminService.getUserGrowth.mockResolvedValue(mockData);

    const { result } = renderHook(() => useUserGrowth('month'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAdminService.getUserGrowth).toHaveBeenCalledWith('month');
    expect(result.current.data).toEqual(mockData);
  });

  it('refetches with a different granularity', async () => {
    mockedAdminService.getUserGrowth.mockResolvedValue({ granularity: 'year', series: [] });

    const { result } = renderHook(() => useUserGrowth('year'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAdminService.getUserGrowth).toHaveBeenCalledWith('year');
  });
});
