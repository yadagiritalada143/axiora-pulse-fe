import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import type { LoginResponse } from '@/features/auth/types';
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
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
    }),
  },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setAuthenticated = jest.fn();
const setHasActivePlan = jest.fn();
const setRole = jest.fn();
const setHasCompletedQuestionnaire = jest.fn();
const setShowQuestionnaireIntro = jest.fn();
const updateUser = jest.fn();

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
        hasCompletedQuestionnaire: false,
        showQuestionnaireIntro: false,
        hasActivePlan: false,
        role: null,

        setMfaData: jest.fn(),
        setAuthenticated,
        updateUser,
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setHasCompletedQuestionnaire,
        setShowQuestionnaireIntro,
        setHasActivePlan,
        setRole,
      }),
    );

    (useAuthStore as unknown as { getState: () => unknown }).getState = () => ({
      updateUser,
      setHasCompletedQuestionnaire,
      setShowQuestionnaireIntro,
      setHasActivePlan,
      setRole,
    });
  });

  it('authenticates, stores tokens, and navigates to dashboard when user has active plan', async () => {
    const successResponse: LoginResponse = {
      status: 'success',
      message: 'Login successful.',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      expires_in_minutes: 60,
      role: 'user',
      auth_actions: {
        payment: true,
        interactive_questions: true,
      },
    };

    mockedAuthService.login.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      username: 'jane@example.com',
      password: 'password123',
    });
    expect(setAuthenticated).toHaveBeenCalledWith('mock-access-token', 'mock-refresh-token');
    expect(setRole).toHaveBeenCalledWith('user');
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(mockedToastSuccess).toHaveBeenCalledWith('Login successful.');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to admin dashboard when role is admin', async () => {
    const adminResponse: LoginResponse = {
      status: 'success',
      message: 'Admin login successful.',
      access_token: 'admin-access-token',
      refresh_token: 'admin-refresh-token',
      token_type: 'bearer',
      expires_in_minutes: 60,
      role: 'admin',
    };

    mockedAuthService.login.mockResolvedValue(adminResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'admin@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setAuthenticated).toHaveBeenCalledWith('admin-access-token', 'admin-refresh-token');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('shows an error toast and does not update the store when login fails', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to sign in. Please try again.');
    expect(setAuthenticated).not.toHaveBeenCalled();
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
