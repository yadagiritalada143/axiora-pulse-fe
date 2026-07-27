import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useVerifyForgotPassword } from '@features/auth/hooks/useVerifyForgotPassword';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/auth', () => ({
  authService: { verifyForgotPassword: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setResetToken = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useVerifyForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        mfaData: null,
        resetEmailOrMobile: 'jane@example.com',
        resetToken: null,
        onboardingPending: false,
        hasActivePlan: false,
        role: null,
        setMfaData: jest.fn(),
        setAuthenticated: jest.fn(),
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken,
        clearResetData: jest.fn(),
        setOnboardingPending: jest.fn(),
        setHasActivePlan: jest.fn(),
        setRole: jest.fn(),
      }),
    );
  });

  it('stores the reset token and shows the success message from the response', async () => {
    mockedAuthService.verifyForgotPassword.mockResolvedValue({
      status: 'success',
      message: 'Code verified.',
      reset_token: 'reset-token-123',
    });

    const { result } = renderHook(() => useVerifyForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', code: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.verifyForgotPassword).toHaveBeenCalledWith({
      emailOrMobile: 'jane@example.com',
      code: 123456,
    });
    expect(setResetToken).toHaveBeenCalledWith('reset-token-123');
    expect(mockedToastSuccess).toHaveBeenCalledWith('Code verified.');
  });

  it('shows an error toast and does not store a token when verification fails', async () => {
    mockedAuthService.verifyForgotPassword.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useVerifyForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', code: 111111 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Invalid or expired code. Please try again.');
    expect(setResetToken).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.verifyForgotPassword.mockRejectedValue({
      status: 400,
      code: 'INVALID_CODE',
      message: 'That code is incorrect.',
    });

    const { result } = renderHook(() => useVerifyForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', code: 111111 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('That code is incorrect.');
  });
});
