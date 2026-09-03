import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@constants/routes';
import { useGoogleLogin } from '@features/auth/hooks/useGoogleLogin';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('@services/auth', () => ({
  authService: {
    googleLogin: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedAuthService = jest.mocked(authService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, undefined, children),
    );
  };
}

const ORIGINAL_STATE = useAuthStore.getState();

afterEach(() => {
  useAuthStore.setState(ORIGINAL_STATE, true);
  jest.clearAllMocks();
});

const BASE_RESPONSE = {
  status: 'success' as const,
  message: 'Signed in with Google.',
  access_token: 'at',
  refresh_token: 'rt',
  token_type: 'bearer',
  expires_in_minutes: 60,
  role: 'user' as const,
  is_new_user: false,
  auth_actions: {
    payment: true,
    interactive_questions: true,
  },
};

describe('useGoogleLogin', () => {
  it('authenticates and navigates to dashboard when the user has a plan', async () => {
    mockedAuthService.googleLogin.mockResolvedValue(BASE_RESPONSE);
    mockedAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      name: 'A',
      role: 'user',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

    result.current.mutate({ credential: 'cred' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAuthService.googleLogin).toHaveBeenCalledWith({ credential: 'cred' });
    expect(toast.success).toHaveBeenCalledWith('Signed in with Google.');
  });

  it('routes new users to onboarding', async () => {
    mockedAuthService.googleLogin.mockResolvedValue({
      ...BASE_RESPONSE,
      is_new_user: true,
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

    result.current.mutate({ credential: 'cred' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().onboardingPending).toBe(true);
  });

  it('routes returning users without a plan to pricing', async () => {
    mockedAuthService.googleLogin.mockResolvedValue({
      ...BASE_RESPONSE,
      auth_actions: { payment: false, interactive_questions: true },
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

    result.current.mutate({ credential: 'cred' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().hasActivePlan).toBe(false);
  });

  it('handles admin role by navigating to admin dashboard', async () => {
    mockedAuthService.googleLogin.mockResolvedValue({
      ...BASE_RESPONSE,
      role: 'admin' as const,
      is_new_user: false,
      auth_actions: undefined,
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

    result.current.mutate({ credential: 'cred' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().role).toBe('admin');
    expect(ROUTES.ADMIN_DASHBOARD).toBeDefined();
  });

  it('shows error toast when the API fails', async () => {
    mockedAuthService.googleLogin.mockRejectedValue(new Error('Google failed'));

    const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

    result.current.mutate({ credential: 'cred' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
  });
});
