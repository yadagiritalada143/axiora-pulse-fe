import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { useResetPassword } from '@features/auth/hooks/useResetPassword';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/auth', () => ({
  authService: { resetPassword: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const clearResetData = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        mfaData: null,
        resetEmailOrMobile: null,
        resetToken: 'reset-token',
        onboardingPending: false,
        hasActivePlan: false,
        role: null,
        setMfaData: jest.fn(),
        setAuthenticated: jest.fn(),
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData,
        setOnboardingPending: jest.fn(),
        setHasActivePlan: jest.fn(),
        setRole: jest.fn(),
      }),
    );
  });

  it('clears reset data, shows a success toast, and navigates to login on success', async () => {
    mockedAuthService.resetPassword.mockResolvedValue({
      status: 'success',
      message: 'Password updated',
    });

    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    result.current.mutate({ reset_token: 'reset-token', new_password: 'newSecret123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.resetPassword).toHaveBeenCalledWith({
      reset_token: 'reset-token',
      new_password: 'newSecret123',
    });
    expect(clearResetData).toHaveBeenCalled();
    expect(mockedToastSuccess).toHaveBeenCalledWith(
      'Password updated successfully. Please sign in.',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows an error toast and does not clear reset data when the request fails', async () => {
    mockedAuthService.resetPassword.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    result.current.mutate({ reset_token: 'reset-token', new_password: 'newSecret123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to reset your password.');
    expect(clearResetData).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.resetPassword.mockRejectedValue({
      status: 400,
      code: 'EXPIRED_TOKEN',
      message: 'Your reset link has expired.',
    });

    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    result.current.mutate({ reset_token: 'reset-token', new_password: 'newSecret123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Your reset link has expired.');
  });
});
