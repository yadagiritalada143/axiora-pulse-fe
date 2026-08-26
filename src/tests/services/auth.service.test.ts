// Mocked apiClient/tokenManager methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import type {
  AdminLoginResponse,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  LoginResponse,
  RegisterResponse,
  ResendOtpResponse,
  ResetPasswordResponse,
  VerifyForgotPasswordResponse,
  VerifyLoginResponse,
  VerifyOtpResponse,
} from '@/features/auth/types';
import type { User } from '@/types/api.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { tokenManager } from '@services/api/tokenManager';
import { authService } from '@services/auth/auth.service';

// `@services/api`'s real client.ts pulls in `import.meta.env` (via app.config), which Babel's
// CommonJS output can't evaluate under Jest - so this mocks the barrel directly instead of
// spreading `jest.requireActual`. auth.service only consumes `apiClient` from this module.
jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedTokenManager = tokenManager as jest.Mocked<typeof tokenManager>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login posts credentials, stores tokens, and returns the response body', async () => {
    const responseBody: LoginResponse = {
      status: 'success',
      message: 'Login successful.',
      access_token: 'login-access-1',
      refresh_token: 'login-refresh-1',
      token_type: 'bearer',
      expires_in_minutes: 60,
      role: 'user',
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.login({ username: 'jane', password: 'secret' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, {
      username: 'jane',
      password: 'secret',
    });
    expect(mockedTokenManager.setTokens).toHaveBeenCalledWith('login-access-1', 'login-refresh-1');
    expect(result).toBe(responseBody);
  });

  it('verifyLogin stores the returned tokens and returns the response body', async () => {
    const responseBody: VerifyLoginResponse = {
      status: 'success',
      message: 'Logged in',
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
      expires_in_minutes: 30,
      role: 'user',
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.verifyLogin({ emailOrMobile: 'jane@test.com', otp: 123456 });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY_LOGIN, {
      emailOrMobile: 'jane@test.com',
      otp: 123456,
    });
    expect(mockedTokenManager.setTokens).toHaveBeenCalledWith('access-1', 'refresh-1');
    expect(result).toBe(responseBody);
  });

  it('adminLogin stores the returned tokens and returns the response body', async () => {
    const responseBody: AdminLoginResponse = {
      status: 'success',
      message: 'Welcome back, admin.',
      access_token: 'admin-access-1',
      refresh_token: 'admin-refresh-1',
      token_type: 'bearer',
      expires_in_minutes: 60,
      role: 'admin',
      actions: ['manage_users'],
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.adminLogin({ username: 'admin', password: 'secret' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ADMIN_LOGIN, {
      username: 'admin',
      password: 'secret',
    });
    expect(mockedTokenManager.setTokens).toHaveBeenCalledWith('admin-access-1', 'admin-refresh-1');
    expect(result).toBe(responseBody);
  });

  it('register posts the payload and returns the response body', async () => {
    const responseBody: RegisterResponse = { userid: 1, username: 'jane', registerMFA: false };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.register({ username: 'jane', password: 'secret' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REGISTER, {
      username: 'jane',
      password: 'secret',
    });
    expect(result).toBe(responseBody);
  });

  it('verifyOTP posts the payload and returns the response body', async () => {
    const responseBody: VerifyOtpResponse = {
      status: 'success',
      message: 'Verified',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
      expires_in_minutes: 60,
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.verifyOTP({ id: 1, otp: 123456, flow: 'register' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      id: 1,
      otp: 123456,
      flow: 'register',
    });
    expect(result).toBe(responseBody);
  });

  it('resendOTP posts the payload and returns the response body', async () => {
    const responseBody: ResendOtpResponse = { userid: 1, username: 'jane', registerMFA: false };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.resendOTP({ id: 1, flow: 'login' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.RESEND_OTP, {
      id: 1,
      flow: 'login',
    });
    expect(result).toBe(responseBody);
  });

  it('forgotPassword posts the payload and returns the response body', async () => {
    const responseBody: ForgotPasswordResponse = { status: 'success', message: 'Code sent' };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.forgotPassword({ emailOrMobile: 'jane@test.com' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST, {
      emailOrMobile: 'jane@test.com',
    });
    expect(result).toBe(responseBody);
  });

  it('verifyForgotPassword posts the payload and returns the response body', async () => {
    const responseBody: VerifyForgotPasswordResponse = {
      status: 'success',
      message: 'Verified',
      reset_token: 'reset-abc',
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.verifyForgotPassword({
      emailOrMobile: 'jane@test.com',
      code: 654321,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY, {
      emailOrMobile: 'jane@test.com',
      code: 654321,
    });
    expect(result).toBe(responseBody);
  });

  it('resetPassword posts the payload and returns the response body', async () => {
    const responseBody: ResetPasswordResponse = { status: 'success', message: 'Password reset' };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.resetPassword({
      reset_token: 'reset-abc',
      new_password: 'new-secret',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, {
      reset_token: 'reset-abc',
      new_password: 'new-secret',
    });
    expect(result).toBe(responseBody);
  });

  it('changePassword posts and returns the response body', async () => {
    const responseBody: ChangePasswordResponse = { status: 'success', message: 'Password changed' };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await authService.changePassword({
      current_password: 'old',
      new_password: 'new',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: 'old',
      new_password: 'new',
    });
    expect(result).toBe(responseBody);
  });

  it('logout posts to the logout endpoint and clears local tokens', async () => {
    mockedApiClient.post.mockResolvedValue({ data: undefined });

    await authService.logout();

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT, {});
    expect(mockedTokenManager.clearTokens).toHaveBeenCalledTimes(1);
  });

  it('getCurrentUser fetches the current user', async () => {
    const user: User = {
      id: '1',
      email: 'jane@test.com',
      name: 'Jane',
      avatarUrl: null,
      role: 'member',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    mockedApiClient.get.mockResolvedValue({ data: user });

    const result = await authService.getCurrentUser();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
    expect(result).toBe(user);
  });
});
