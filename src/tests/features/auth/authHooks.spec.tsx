import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { ApiRequestError } from '@/types/error.types';
import { ROUTES } from '@constants/routes';
import { useForgotPassword } from '@features/auth/hooks/useForgotPassword';
import { useLogin } from '@features/auth/hooks/useLogin';
import { useRegister } from '@features/auth/hooks/useRegister';
import { useResendOtp } from '@features/auth/hooks/useResendOtp';
import { useResetPassword } from '@features/auth/hooks/useResetPassword';
import { useVerifyForgotPassword } from '@features/auth/hooks/useVerifyForgotPassword';
import { useVerifyLogin } from '@features/auth/hooks/useVerifyLogin';
import { useVerifyOtp } from '@features/auth/hooks/useVerifyOtp';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    verifyOTP: jest.fn(),
    verifyLogin: jest.fn(),
    resendOTP: jest.fn(),
    forgotPassword: jest.fn(),
    verifyForgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const {
  login,
  register,
  verifyOTP,
  verifyLogin,
  resendOTP,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
} = authService as unknown as Record<
  | 'login'
  | 'register'
  | 'verifyOTP'
  | 'verifyLogin'
  | 'resendOTP'
  | 'forgotPassword'
  | 'verifyForgotPassword'
  | 'resetPassword',
  jest.Mock
>;

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.getState().clearSession();
});

describe('useLogin', () => {
  it('stores MFA data, toasts, and navigates on success', async () => {
    login.mockResolvedValue({ status: 'success', message: 'ok' });
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ username: 'user@example.com', password: 'password1' });

    expect(useAuthStore.getState().mfaData?.username).toBe('user@example.com');
    expect(toast.success).toHaveBeenCalledWith('OTP sent successfully.');
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VERIFY_LOGIN);
  });

  it('toasts the API error message on failure', async () => {
    login.mockRejectedValue(new ApiRequestError({ status: 401, code: 'X', message: 'Bad creds' }));
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ username: 'user@example.com', password: 'password1' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Bad creds');
  });

  it('toasts a generic message for unknown errors', async () => {
    login.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ username: 'user@example.com', password: 'password1' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Unable to sign in. Please try again.');
  });
});

describe('useRegister', () => {
  it('stores MFA data from the response and navigates on success', async () => {
    register.mockResolvedValue({ userid: 7, username: 'newuser', registerMFA: true });
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ username: 'user@example.com', password: 'password1' });

    expect(useAuthStore.getState().mfaData?.userid).toBe(7);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VERIFY_OTP);
  });

  it('toasts a generic error on failure', async () => {
    register.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ username: 'user@example.com', password: 'password1' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Unable to create account. Please try again.');
  });
});

describe('useVerifyOtp', () => {
  it('authenticates and navigates to onboarding on register flow', async () => {
    verifyOTP.mockResolvedValue({
      status: 'success',
      message: '',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
      expires_in_minutes: 60,
    });
    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 1, otp: 111111, flow: 'register' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().onboardingPending).toBe(true);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ONBOARDING);
  });

  it('toasts the response message when verification is not successful', async () => {
    verifyOTP.mockResolvedValue({ status: 'failed', message: 'Wrong code' });
    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 1, otp: 111111, flow: 'register' });

    expect(toast.error).toHaveBeenCalledWith('Wrong code');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('toasts a generic error on failure', async () => {
    verifyOTP.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ id: 1, otp: 111111, flow: 'register' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('OTP verification failed.');
  });
});

describe('useVerifyLogin', () => {
  it('authenticates and navigates to dashboard when a plan is active', async () => {
    verifyLogin.mockResolvedValue({
      status: 'success',
      access_token: 'a',
      refresh_token: 'r',
      message: 'Welcome',
      role: 'user',
      hasActivePlan: true,
    });
    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ emailOrMobile: 'u@e.com', otp: 123456 });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().hasActivePlan).toBe(true);
    expect(useAuthStore.getState().role).toBe('user');
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('navigates to pricing when there is no active plan', async () => {
    verifyLogin.mockResolvedValue({
      status: 'success',
      access_token: 'a',
      refresh_token: 'r',
      message: '',
      role: 'user',
    });
    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ emailOrMobile: 'u@e.com', otp: 123456 });

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRICING);
    expect(toast.success).toHaveBeenCalledWith('Login successful.');
  });

  it('toasts the message when status is not success', async () => {
    verifyLogin.mockResolvedValue({ status: 'failed', message: 'Nope' });
    const { result } = renderHook(() => useVerifyLogin(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ emailOrMobile: 'u@e.com', otp: 123456 });

    expect(toast.error).toHaveBeenCalledWith('Nope');
  });
});

describe('useResendOtp', () => {
  it('resends the OTP using the stored MFA session', async () => {
    useAuthStore.getState().setMfaData({
      userid: 3,
      username: 'jane',
      identifier: 'jane',
      mfaVerified: false,
      flow: 'login',
    });
    resendOTP.mockResolvedValue({ userid: 3, username: 'jane', registerMFA: true });
    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    await result.current.mutateAsync();

    expect(resendOTP).toHaveBeenCalledWith({ id: 3, flow: 'login' });
    expect(toast.success).toHaveBeenCalledWith('OTP has been sent to jane.');
  });

  it('errors when there is no MFA session', async () => {
    const { result } = renderHook(() => useResendOtp(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync()).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('OTP session has expired. Please sign in again.');
  });
});

describe('useForgotPassword', () => {
  it('stores the reset identifier and toasts on success', async () => {
    forgotPassword.mockResolvedValue({ status: 'success', message: 'sent' });
    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ emailOrMobile: 'u@e.com' });

    expect(useAuthStore.getState().resetEmailOrMobile).toBe('u@e.com');
    expect(toast.success).toHaveBeenCalledWith('Password reset code has been sent.');
  });

  it('toasts a generic error on failure', async () => {
    forgotPassword.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync({ emailOrMobile: 'u@e.com' })).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Unable to send the reset code.');
  });
});

describe('useVerifyForgotPassword', () => {
  it('stores the reset token and toasts on success', async () => {
    verifyForgotPassword.mockResolvedValue({
      status: 'success',
      message: 'verified',
      reset_token: 'reset-token',
    });
    const { result } = renderHook(() => useVerifyForgotPassword(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ emailOrMobile: 'u@e.com', code: 123456 });

    expect(useAuthStore.getState().resetToken).toBe('reset-token');
    expect(toast.success).toHaveBeenCalledWith('verified');
  });

  it('toasts a generic error on failure', async () => {
    verifyForgotPassword.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useVerifyForgotPassword(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ emailOrMobile: 'u@e.com', code: 123456 }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Invalid or expired code. Please try again.');
  });
});

describe('useResetPassword', () => {
  it('clears reset data, toasts, and navigates to login on success', async () => {
    useAuthStore.getState().setResetToken('reset-token');
    resetPassword.mockResolvedValue({ status: 'success', message: 'done' });
    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ reset_token: 'reset-token', new_password: 'password1' });

    expect(useAuthStore.getState().resetToken).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('toasts a generic error on failure', async () => {
    resetPassword.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({ reset_token: 'reset-token', new_password: 'password1' }),
    ).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('Unable to reset your password.');
  });
});
