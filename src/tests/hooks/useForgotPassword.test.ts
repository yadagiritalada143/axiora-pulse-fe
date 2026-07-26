import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useForgotPassword } from '@features/auth/hooks/useForgotPassword';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/auth', () => ({
  authService: { forgotPassword: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setResetEmailOrMobile = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useForgotPassword', () => {
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
        setMfaData: jest.fn(),
        setAuthenticated: jest.fn(),
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile,
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setOnboardingPending: jest.fn(),
        setHasActivePlan: jest.fn(),
      }),
    );
  });

  it('stores the target email/mobile and shows a success toast', async () => {
    mockedAuthService.forgotPassword.mockResolvedValue({
      status: 'success',
      message: 'Code sent',
    });

    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.forgotPassword).toHaveBeenCalledWith({
      emailOrMobile: 'jane@example.com',
    });
    expect(setResetEmailOrMobile).toHaveBeenCalledWith('jane@example.com');
    expect(mockedToastSuccess).toHaveBeenCalledWith('Password reset code has been sent.');
  });

  it('shows an error toast and does not store the email when the request fails', async () => {
    mockedAuthService.forgotPassword.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to send the reset code.');
    expect(setResetEmailOrMobile).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.forgotPassword.mockRejectedValue({
      status: 404,
      code: 'NOT_FOUND',
      message: 'No account found for that email.',
    });

    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'missing@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('No account found for that email.');
  });
});
