import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useResendOtp } from '@features/auth/hooks/useResendOtp';
import { authService } from '@services/auth';
import type { MFAData } from '@store/auth.store';
import { useAuthStore } from '@store/auth.store';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/auth', () => ({
  authService: { resendOTP: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);

function mockStoreWithMfaData(mfaData: MFAData | null) {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      user: null,
      isAuthenticated: false,
      mfaData,
      resetEmailOrMobile: null,
      resetToken: null,
      hasActivePlan: false,
      role: null,

      setMfaData: jest.fn(),
      setAuthenticated: jest.fn(),
      updateUser: jest.fn(),
      clearSession: jest.fn(),
      setResetEmailOrMobile: jest.fn(),
      setResetToken: jest.fn(),
      clearResetData: jest.fn(),
      setHasActivePlan: jest.fn(),
      setRole: jest.fn(),

      hasCompletedQuestionnaire: false,
      showQuestionnaireIntro: false,
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    }),
  );
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useResendOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resends the OTP using the active MFA session and shows a success toast', async () => {
    mockStoreWithMfaData({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'register',
    });
    mockedAuthService.resendOTP.mockResolvedValue({
      userid: 42,
      username: 'jane@example.com',
      registerMFA: true,
    });

    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.resendOTP).toHaveBeenCalledWith({
      id: 42,
      emailOrMobile: 'jane@example.com',
      flow: 'register',
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith('OTP has been sent to jane@example.com.');
  });

  it('shows an expiry error and never calls the service when the MFA session is missing', async () => {
    mockStoreWithMfaData(null);

    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedAuthService.resendOTP).not.toHaveBeenCalled();
    expect(mockedToastError).toHaveBeenCalledWith('OTP session has expired. Please sign in again.');
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockStoreWithMfaData({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'login',
    });
    mockedAuthService.resendOTP.mockRejectedValue({
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Too many requests, please wait.',
    });

    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Too many requests, please wait.');
  });

  it('falls back to a generic message for a non-Error, non-ApiError rejection', async () => {
    mockStoreWithMfaData({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'login',
    });
    mockedAuthService.resendOTP.mockRejectedValue('boom');

    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to resend OTP.');
  });
});
