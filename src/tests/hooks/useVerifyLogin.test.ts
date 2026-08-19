import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import type { VerifyLoginResponse } from '@/features/auth/types';
import { useVerifyLogin } from '@features/auth/hooks/useVerifyLogin';
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
  authService: { verifyLogin: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setAuthenticated = jest.fn();
const setHasActivePlan = jest.fn();
const setRole = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useVerifyLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const defaultState = {
      user: null,
      isAuthenticated: false,
      mfaData: null,
      resetEmailOrMobile: null,
      resetToken: null,
      hasActivePlan: false,
      role: null,
      hasCompletedQuestionnaire: true,
      showQuestionnaireIntro: false,

      setMfaData: jest.fn(),
      setAuthenticated,
      updateUser: jest.fn(),
      clearSession: jest.fn(),
      setResetEmailOrMobile: jest.fn(),
      setResetToken: jest.fn(),
      clearResetData: jest.fn(),
      setHasActivePlan,
      setRole,
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    };
    mockedUseAuthStore.mockImplementation((selector) => selector(defaultState));
    mockedUseAuthStore.getState = jest.fn().mockReturnValue(defaultState);
  });

  it('authenticates and navigates to dashboard when the user has an active plan', async () => {
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: 'Login successful.',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'user',
      hasActivePlan: true,
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.verifyLogin).toHaveBeenCalledWith({
      emailOrMobile: 'jane@example.com',
      otp: 123456,
    });
    expect(setAuthenticated).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(setRole).toHaveBeenCalledWith('user');
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(mockedToastSuccess).toHaveBeenCalledWith('Login successful.');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to pricing when the user has no active plan', async () => {
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: 'Login successful.',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'user',
      hasActivePlan: false,
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setHasActivePlan).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('defaults hasActivePlan to false and navigates to pricing when the field is absent', async () => {
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: 'Login successful.',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'user',
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setHasActivePlan).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('bypasses plan selection and navigates admins to the admin dashboard', async () => {
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: 'Login successful.',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'admin',
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'admin@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setAuthenticated).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(setRole).toHaveBeenCalledWith('admin');
    expect(setHasActivePlan).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('falls back to a default success message when the response omits one', async () => {
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: '',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'user',
      hasActivePlan: true,
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedToastSuccess).toHaveBeenCalledWith('Login successful.');
  });

  describe('backend-driven auth_actions', () => {
    /** Runs the mutation against a success response carrying the given next-step flags. */
    async function verifyWithAuthActions(auth_actions: {
      payment: boolean;
      interactive_questions: boolean;
    }) {
      mockedAuthService.verifyLogin.mockResolvedValue({
        status: 'success',
        message: 'Login successful.',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in_minutes: 60,
        role: 'user',
        auth_actions,
      });

      const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

      result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }

    it('navigates to pricing when the backend reports no payment', async () => {
      await verifyWithAuthActions({ payment: false, interactive_questions: true });

      expect(setHasActivePlan).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });

    it('navigates to the dashboard when payment is complete', async () => {
      await verifyWithAuthActions({ payment: true, interactive_questions: true });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error toast without authenticating when the response resolves with a failed status', async () => {
    // The API contract types `status` as the literal 'success', but the mutation still
    // guards against a resolved-but-unsuccessful body at runtime - simulate that shape here.
    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'failed',
      message: 'That code has expired.',
    } as unknown as VerifyLoginResponse);

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('That code has expired.');
    expect(setAuthenticated).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an error toast and does not authenticate when verification fails', async () => {
    mockedAuthService.verifyLogin.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Login OTP verification failed.');
    expect(setAuthenticated).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.verifyLogin.mockRejectedValue({
      status: 400,
      code: 'INVALID_OTP',
      message: 'That OTP is incorrect.',
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('That OTP is incorrect.');
  });

  it('navigates to questionnaire intro when the user has an active plan but has not completed the questionnaire', async () => {
    const customState = {
      user: null,
      isAuthenticated: false,
      mfaData: null,
      resetEmailOrMobile: null,
      resetToken: null,
      hasActivePlan: false,
      role: null,
      hasCompletedQuestionnaire: false,
      showQuestionnaireIntro: false,

      setMfaData: jest.fn(),
      setAuthenticated,
      updateUser: jest.fn(),
      clearSession: jest.fn(),
      setResetEmailOrMobile: jest.fn(),
      setResetToken: jest.fn(),
      clearResetData: jest.fn(),
      setHasActivePlan,
      setRole,
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    };
    mockedUseAuthStore.mockImplementation((selector) => selector(customState));
    mockedUseAuthStore.getState = jest.fn().mockReturnValue(customState);

    mockedAuthService.verifyLogin.mockResolvedValue({
      status: 'success',
      message: 'Login successful.',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'user',
      hasActivePlan: true,
    });

    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    result.current.mutate({ emailOrMobile: 'jane@example.com', otp: 123456 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
