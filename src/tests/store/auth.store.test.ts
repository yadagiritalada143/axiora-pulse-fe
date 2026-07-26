import { act } from '@testing-library/react';

import type { User } from '@/types/api.types';
import { tokenManager } from '@services/api/tokenManager';
import { useAuthStore, type MFAData } from '@store/auth.store';

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: { setTokens: jest.fn(), clearTokens: jest.fn() },
}));

const mockSetTokens = tokenManager.setTokens as jest.Mock;
const mockClearTokens = tokenManager.clearTokens as jest.Mock;

const initialState = useAuthStore.getState();

const mockUser: User = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockMfaData: MFAData = {
  userid: 1,
  username: 'jane',
  identifier: 'jane@example.com',
  mfaVerified: false,
  flow: 'login',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialState, true);
    });
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('has the expected default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mfaData).toBeNull();
    expect(state.resetEmailOrMobile).toBeNull();
    expect(state.resetToken).toBeNull();
    expect(state.onboardingPending).toBe(false);
    expect(state.hasActivePlan).toBe(false);
  });

  it('setMfaData stores the MFA payload', () => {
    act(() => {
      useAuthStore.getState().setMfaData(mockMfaData);
    });

    expect(useAuthStore.getState().mfaData).toEqual(mockMfaData);
  });

  it('setAuthenticated marks the session authenticated, clears MFA data, and persists tokens', () => {
    act(() => {
      useAuthStore.getState().setMfaData(mockMfaData);
      useAuthStore.getState().setAuthenticated('access-token', 'refresh-token');
    });

    expect(mockSetTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().mfaData).toBeNull();
  });

  it('setAuthenticated works without a refresh token', () => {
    act(() => {
      useAuthStore.getState().setAuthenticated('access-token');
    });

    expect(mockSetTokens).toHaveBeenCalledWith('access-token', undefined);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('updateUser stores the user', () => {
    act(() => {
      useAuthStore.getState().updateUser(mockUser);
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('clearSession resets all session state and clears tokens', () => {
    act(() => {
      useAuthStore.getState().updateUser(mockUser);
      useAuthStore.getState().setAuthenticated('access-token', 'refresh-token');
      useAuthStore.getState().setOnboardingPending(true);
      useAuthStore.getState().setHasActivePlan(true);
      useAuthStore.getState().setResetEmailOrMobile('jane@example.com');
      useAuthStore.getState().setResetToken('reset-token');
      useAuthStore.getState().clearSession();
    });

    expect(mockClearTokens).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mfaData).toBeNull();
    expect(state.resetEmailOrMobile).toBeNull();
    expect(state.resetToken).toBeNull();
    expect(state.onboardingPending).toBe(false);
    expect(state.hasActivePlan).toBe(false);
  });

  it('setOnboardingPending updates the onboarding flag', () => {
    act(() => {
      useAuthStore.getState().setOnboardingPending(true);
    });

    expect(useAuthStore.getState().onboardingPending).toBe(true);
  });

  it('setHasActivePlan updates the active plan flag', () => {
    act(() => {
      useAuthStore.getState().setHasActivePlan(true);
    });

    expect(useAuthStore.getState().hasActivePlan).toBe(true);
  });

  it('setResetEmailOrMobile stores the reset identifier', () => {
    act(() => {
      useAuthStore.getState().setResetEmailOrMobile('jane@example.com');
    });

    expect(useAuthStore.getState().resetEmailOrMobile).toBe('jane@example.com');
  });

  it('setResetToken stores the reset token', () => {
    act(() => {
      useAuthStore.getState().setResetToken('reset-token');
    });

    expect(useAuthStore.getState().resetToken).toBe('reset-token');
  });

  it('clearResetData clears only the reset-related fields', () => {
    act(() => {
      useAuthStore.getState().updateUser(mockUser);
      useAuthStore.getState().setResetEmailOrMobile('jane@example.com');
      useAuthStore.getState().setResetToken('reset-token');
      useAuthStore.getState().clearResetData();
    });

    const state = useAuthStore.getState();
    expect(state.resetEmailOrMobile).toBeNull();
    expect(state.resetToken).toBeNull();
    expect(state.user).toEqual(mockUser);
  });
});
