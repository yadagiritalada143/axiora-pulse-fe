import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { useVerifyOtp } from '@features/auth/hooks/useVerifyOtp';
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
  authService: { verifyOTP: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastError = jest.mocked(toast.error);
const setAuthenticated = jest.fn();
const setOnboardingPending = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useVerifyOtp', () => {
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
        setAuthenticated,
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setOnboardingPending,
        setHasActivePlan: jest.fn(),
      }),
    );
  });

  it('authenticates, flags onboarding as pending, and navigates to the dashboard on success', async () => {
    mockedAuthService.verifyOTP.mockResolvedValue({
      status: 'success',
      message: 'Verified.',
      jwt: 'jwt-token',
    });

    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    result.current.mutate({ id: 42, otp: 123456, flow: 'register' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.verifyOTP).toHaveBeenCalledWith({
      id: 42,
      otp: 123456,
      flow: 'register',
    });
    expect(setAuthenticated).toHaveBeenCalledWith('jwt-token');
    expect(setOnboardingPending).toHaveBeenCalledWith(true);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows the response message and does not authenticate when status is not success', async () => {
    mockedAuthService.verifyOTP.mockResolvedValue({
      status: 'failed',
      message: 'The code you entered is incorrect.',
    });

    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    result.current.mutate({ id: 42, otp: 111111, flow: 'register' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('The code you entered is incorrect.');
    expect(setAuthenticated).not.toHaveBeenCalled();
    expect(setOnboardingPending).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the response message when status is success but no jwt is returned', async () => {
    mockedAuthService.verifyOTP.mockResolvedValue({
      status: 'success',
      message: 'Missing token.',
    });

    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    result.current.mutate({ id: 42, otp: 111111, flow: 'register' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Missing token.');
    expect(setAuthenticated).not.toHaveBeenCalled();
  });

  it('shows an error toast when verification rejects', async () => {
    mockedAuthService.verifyOTP.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    result.current.mutate({ id: 42, otp: 111111, flow: 'register' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('OTP verification failed.');
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.verifyOTP.mockRejectedValue({
      status: 400,
      code: 'INVALID_OTP',
      message: 'That OTP is incorrect.',
    });

    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    result.current.mutate({ id: 42, otp: 111111, flow: 'register' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('That OTP is incorrect.');
  });
});
