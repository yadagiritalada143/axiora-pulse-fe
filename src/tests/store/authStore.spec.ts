import type { User } from '@/types/api.types';
import { tokenManager } from '@services/api/tokenManager';
import { useAuthStore, type MFAData } from '@store/auth.store';

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: {
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const { setTokens, clearTokens } = tokenManager as unknown as {
  setTokens: jest.Mock;
  clearTokens: jest.Mock;
};

const mfaData: MFAData = {
  userid: 1,
  username: 'jane',
  identifier: 'jane@example.com',
  mfaVerified: false,
  flow: 'login',
};

const user: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    jest.clearAllMocks();
  });

  it('marks the session authenticated and stores tokens', () => {
    useAuthStore.getState().setAuthenticated('access-token', 'refresh-token');

    expect(setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().mfaData).toBeNull();
  });

  it('stores MFA data and the current user', () => {
    useAuthStore.getState().setMfaData(mfaData);
    expect(useAuthStore.getState().mfaData).toEqual(mfaData);

    useAuthStore.getState().updateUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('sets reset flow data and clears it', () => {
    useAuthStore.getState().setResetEmailOrMobile('jane@example.com');
    useAuthStore.getState().setResetToken('reset-token');
    expect(useAuthStore.getState().resetEmailOrMobile).toBe('jane@example.com');
    expect(useAuthStore.getState().resetToken).toBe('reset-token');

    useAuthStore.getState().clearResetData();
    expect(useAuthStore.getState().resetEmailOrMobile).toBeNull();
    expect(useAuthStore.getState().resetToken).toBeNull();
  });

  it('sets onboarding and active-plan flags', () => {
    useAuthStore.getState().setOnboardingPending(true);
    useAuthStore.getState().setHasActivePlan(true);

    expect(useAuthStore.getState().onboardingPending).toBe(true);
    expect(useAuthStore.getState().hasActivePlan).toBe(true);
  });

  it('clears the session and tokens', () => {
    useAuthStore.getState().setAuthenticated('a');
    useAuthStore.getState().updateUser(user);

    useAuthStore.getState().clearSession();

    expect(clearTokens).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
