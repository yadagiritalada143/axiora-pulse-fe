import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { useAdminLogin } from '@features/auth/hooks/useAdminLogin';
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
  authService: { adminLogin: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);
const setAuthenticated = jest.fn();
const setRole = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminLogin', () => {
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
        updateUser: jest.fn(),
        clearSession: jest.fn(),
        setResetEmailOrMobile: jest.fn(),
        setResetToken: jest.fn(),
        clearResetData: jest.fn(),
        setHasCompletedQuestionnaire: jest.fn(),
        setShowQuestionnaireIntro: jest.fn(),
        setHasActivePlan: jest.fn(),
        setRole,
      }),
    );
  });

  it('authenticates, stores the admin role, shows a success toast, and navigates to the admin dashboard', async () => {
    mockedAuthService.adminLogin.mockResolvedValue({
      status: 'success',
      message: 'Welcome back, admin.',
      access_token: 'admin-access-token',
      refresh_token: 'admin-refresh-token',
      token_type: 'Bearer',
      expires_in_minutes: 60,
      role: 'admin',
      actions: ['manage_users'],
    });

    const { result } = renderHook(() => useAdminLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'admin@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.adminLogin).toHaveBeenCalledWith({
      username: 'admin@example.com',
      password: 'password123',
    });
    expect(setAuthenticated).toHaveBeenCalledWith('admin-access-token', 'admin-refresh-token');
    expect(setRole).toHaveBeenCalledWith('admin');
    expect(mockedToastSuccess).toHaveBeenCalledWith('Welcome back, admin.');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('shows an error toast and does not authenticate when the login fails', async () => {
    mockedAuthService.adminLogin.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAdminLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'admin@example.com', password: 'wrongpass' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to sign in. Please try again.');
    expect(setAuthenticated).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the API error message when the service rejects with a normalized ApiError', async () => {
    mockedAuthService.adminLogin.mockRejectedValue({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid admin credentials.',
    });

    const { result } = renderHook(() => useAdminLogin(), { wrapper: createWrapper() });

    result.current.mutate({ username: 'admin@example.com', password: 'wrongpass' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Invalid admin credentials.');
  });
});
