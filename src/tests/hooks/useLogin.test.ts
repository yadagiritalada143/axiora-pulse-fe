import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { useLogin } from '@features/auth/hooks/useLogin';
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
  authService: { login: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setMfaData = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        mfaData: null,
        resetEmailOrMobile: null,
        resetToken: null,
        onboardingPending: false,
        hasActivePlan: false,
        setMfaData,
        setAuthenticated: jest.fn(),
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setOnboardingPending: jest.fn(),
        setHasActivePlan: jest.fn(),
      }),
    );
  });

  it('stores MFA data, shows a success toast, and navigates to verify-login on success', async () => {
    mockedAuthService.login.mockResolvedValue({ status: 'success', message: 'OTP sent' });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      username: 'jane@example.com',
      password: 'password123',
    });
    expect(setMfaData).toHaveBeenCalledWith({
      userid: 0,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'login',
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith('OTP sent successfully.');
    expect(mockNavigate).toHaveBeenCalledWith('/verify-login');
  });

  it('shows an error toast and does not update the store when login fails', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to sign in. Please try again.');
    expect(setMfaData).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.login.mockRejectedValue({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials provided.',
    });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'wrongpass' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Invalid credentials provided.');
  });
});
