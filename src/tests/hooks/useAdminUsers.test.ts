import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { useAdminUsers } from '@features/admin/hooks/useAdminUsers';
import { adminService } from '@services/admin';

jest.mock('@services/admin', () => ({
  adminService: {
    listUsers: jest.fn(),
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

describe('useAdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches users list using adminService.listUsers', async () => {
    const mockData = {
      users: [
        {
          id: 10,
          username: 'admin@example.com',
          display_name: 'Admin',
          role: 'admin',
          created_at: '2026-07-30T10:00:00.000Z',
          workspace_count: 5,
        },
      ],
      pagination: {
        total: 1,
        limit: 25,
        offset: 0,
      },
    };

    mockedAdminService.listUsers.mockResolvedValue(mockData);

    const params = { limit: 25, offset: 0 };
    const { result } = renderHook(() => useAdminUsers(params), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAdminService.listUsers).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockData);
  });
});
