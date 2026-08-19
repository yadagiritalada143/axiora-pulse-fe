import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { ApiRequestError } from '@/types/error.types';
import { useUpdateProfile } from '@features/settings/hooks/useUpdateProfile';
import { apiClient } from '@services/api';
import { useAuthStore } from '@store/auth.store';

jest.mock('@services/api', () => ({
  apiClient: { patch: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const { patch } = apiClient as unknown as { patch: jest.Mock };

const updatedUser: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane Updated',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('updates the user, toasts success, on a successful response', async () => {
    patch.mockResolvedValue({ data: { data: updatedUser } });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: 'Jane Updated', email: 'jane@example.com' });

    expect(useAuthStore.getState().user).toEqual(updatedUser);
    expect(toast.success).toHaveBeenCalledWith('Profile updated.');
  });

  it('toasts the API error message on a known API error', async () => {
    patch.mockRejectedValue(
      new ApiRequestError({ status: 400, code: 'BAD', message: 'Email already used' }),
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
    await expect(
      result.current.mutateAsync({ name: 'Jane', email: 'jane@example.com' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Email already used');
  });

  it('toasts a generic message on an unknown error', async () => {
    patch.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
    await expect(
      result.current.mutateAsync({ name: 'Jane', email: 'jane@example.com' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Unable to update your profile.');
  });
});
