import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { ApiRequestError } from '@/types/error.types';
import { queryKeys } from '@constants/queryKeys';
import { useUpdateProfile } from '@features/settings/hooks/useUpdateProfile';
import { apiClient } from '@services/api';
import { useAuthStore } from '@store/auth.store';

jest.mock('@services/api', () => ({
  apiClient: {
    patch: jest.fn(),
  },
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const user: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane',
  avatarUrl: null,
  avatar_url: null,
  role: 'member',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const updateUser = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { queryClient, Wrapper };
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { updateUser: typeof updateUser }) => unknown) => selector({ updateUser }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates the auth store, sets the profile query data, and toasts on success', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { data: user } });

    const { Wrapper, queryClient } = createWrapper();
    const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });

    result.current.mutate({ name: 'Jane', email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/users/me', {
      name: 'Jane',
      email: 'jane@example.com',
    });
    expect(updateUser).toHaveBeenCalledWith(user);
    expect(setQueryDataSpy).toHaveBeenCalledWith(queryKeys.user.profile(), user);
    expect(mockedToast.success).toHaveBeenCalledWith('Profile updated successfully.');
  });

  it('toasts the API error message when the request fails with a normalized error', async () => {
    const apiError = new ApiRequestError({ status: 422, code: 'VALIDATION', message: 'Bad email' });
    mockedApiClient.patch.mockRejectedValueOnce(apiError);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });

    result.current.mutate({ name: 'Jane', email: 'not-an-email' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith('Bad email');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('toasts a fallback message when the request fails with a generic error', async () => {
    mockedApiClient.patch.mockRejectedValueOnce(new Error('boom'));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });

    result.current.mutate({ name: 'Jane', email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith('Unable to update your profile.');
  });
});
