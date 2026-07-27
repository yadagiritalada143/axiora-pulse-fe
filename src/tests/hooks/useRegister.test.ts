import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { useRegister } from '@features/auth/hooks/useRegister';
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
  authService: { register: jest.fn() },
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

describe('useRegister', () => {
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
        role: null,
        setMfaData,
        setAuthenticated: jest.fn(),
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setOnboardingPending: jest.fn(),
        setHasActivePlan: jest.fn(),
        setRole: jest.fn(),
      }),
    );
  });

  it('stores MFA data, shows a success toast, and navigates to verify-otp on success', async () => {
    mockedAuthService.register.mockResolvedValue({
      userid: 42,
      username: 'jane@example.com',
      registerMFA: true,
    });

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.register).toHaveBeenCalledWith({
      username: 'jane@example.com',
      password: 'password123',
    });
    expect(setMfaData).toHaveBeenCalledWith({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'register',
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith('OTP sent successfully.');
    expect(mockNavigate).toHaveBeenCalledWith('/verify-otp');
  });

  it('shows an error toast and does not update the store when registration fails', async () => {
    mockedAuthService.register.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to create account. Please try again.');
    expect(setMfaData).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.register.mockRejectedValue({
      status: 409,
      code: 'USERNAME_TAKEN',
      message: 'That username is already registered.',
    });

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('That username is already registered.');
  });
});
