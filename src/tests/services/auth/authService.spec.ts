import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { tokenManager } from '@services/api/tokenManager';
import { authService } from '@services/auth/auth.service';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: {
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const { post, get } = apiClient as unknown as { post: jest.Mock; get: jest.Mock };
const { setTokens, clearTokens } = tokenManager as unknown as {
  setTokens: jest.Mock;
  clearTokens: jest.Mock;
};

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('login posts credentials', async () => {
    post.mockResolvedValue({ data: { status: 'success', message: 'ok' } });

    const result = await authService.login({ username: 'u', password: 'p' });

    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, { username: 'u', password: 'p' });
    expect(result).toEqual({ status: 'success', message: 'ok' });
  });

  it('verifyLogin stores the returned tokens', async () => {
    post.mockResolvedValue({
      data: { access_token: 'access', refresh_token: 'refresh' },
    });

    await authService.verifyLogin({ emailOrMobile: 'u@e.com', otp: 123456 });

    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY_LOGIN, {
      emailOrMobile: 'u@e.com',
      otp: 123456,
    });
    expect(setTokens).toHaveBeenCalledWith('access', 'refresh');
  });

  it('register posts the payload', async () => {
    post.mockResolvedValue({ data: { userid: 1 } });
    await authService.register({ username: 'u', password: 'p' });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REGISTER, {
      username: 'u',
      password: 'p',
    });
  });

  it('verifyOTP posts the payload', async () => {
    post.mockResolvedValue({ data: { status: 'success' } });
    await authService.verifyOTP({ id: 1, otp: 111111, flow: 'register' });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      id: 1,
      otp: 111111,
      flow: 'register',
    });
  });

  it('resendOTP posts the payload', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.resendOTP({ id: 1, flow: 'login' });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.RESEND_OTP, { id: 1, flow: 'login' });
  });

  it('forgotPassword posts the payload', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.forgotPassword({ emailOrMobile: 'u@e.com' });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST, {
      emailOrMobile: 'u@e.com',
    });
  });

  it('verifyForgotPassword posts the payload', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.verifyForgotPassword({ emailOrMobile: 'u@e.com', code: 123456 });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY, {
      emailOrMobile: 'u@e.com',
      code: 123456,
    });
  });

  it('resetPassword posts the payload', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.resetPassword({ reset_token: 't', new_password: 'p' });
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, {
      reset_token: 't',
      new_password: 'p',
    });
  });

  it('changePassword posts with credentials', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.changePassword({ current_password: 'a', new_password: 'b' });
    expect(post).toHaveBeenCalledWith(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { current_password: 'a', new_password: 'b' },
      { withCredentials: true },
    );
  });

  it('logout clears tokens', async () => {
    post.mockResolvedValue({ data: {} });
    await authService.logout();
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT, {}, { withCredentials: true });
    expect(clearTokens).toHaveBeenCalled();
  });

  it('getCurrentUser fetches the current user', async () => {
    get.mockResolvedValue({ data: { id: '1', name: 'Jane' } });
    const result = await authService.getCurrentUser();
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME, { withCredentials: true });
    expect(result).toEqual({ id: '1', name: 'Jane' });
  });
});
