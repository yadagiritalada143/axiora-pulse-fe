import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { User } from '@/types/api.types';
import { useCurrentUser } from '@features/auth/hooks/useCurrentUser';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('@services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches current user profile from authService when authenticated', async () => {
    const mockUser: User = {
      id: 'usr_123',
      email: 'user@example.com',
      name: 'John Doe',
      avatarUrl: null,
      role: 'member',
      createdAt: '2026-07-30T10:09:31.072Z',
      updatedAt: '2026-07-30T10:09:31.072Z',
    };

    const mockUpdateUser = jest.fn();

    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: true,
        updateUser: mockUpdateUser,
      } as unknown as ReturnType<typeof useAuthStore.getState>),
    );

    mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.data).toEqual(mockUser);
  });
});
