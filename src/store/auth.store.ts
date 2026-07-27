import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/api.types';
import type { AccountRole } from '@/types/common.types';
import { STORAGE_KEYS } from '@constants/storage';
import { tokenManager } from '@services/api/tokenManager';

export interface MFAData {
  userid: number;
  username: string;
  identifier: string;
  mfaVerified: boolean;
  flow: 'register' | 'login';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaData: MFAData | null;
  resetEmailOrMobile: string | null;
  resetToken: string | null;
  onboardingPending: boolean;
  hasActivePlan: boolean;
  role: AccountRole | null;
}

interface AuthActions {
  setMfaData: (data: MFAData) => void;
  setAuthenticated: (accessToken: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
  setResetEmailOrMobile: (emailOrMobile: string) => void;
  setResetToken: (token: string) => void;
  clearResetData: () => void;
  setOnboardingPending: (pending: boolean) => void;
  setHasActivePlan: (hasActivePlan: boolean) => void;
  setRole: (role: AccountRole) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,

      isAuthenticated: false,

      mfaData: null,

      resetEmailOrMobile: null,
      resetToken: null,

      onboardingPending: false,

      hasActivePlan: false,

      role: null,

      setMfaData: (data) => {
        set({
          mfaData: data,
        });
      },

      setAuthenticated: (accessToken, refreshToken) => {
        tokenManager.setTokens(accessToken, refreshToken);

        set({
          isAuthenticated: true,
          mfaData: null,
        });
      },

      updateUser: (user) => {
        set({
          user,
        });
      },

      clearSession: () => {
        tokenManager.clearTokens();

        set({
          user: null,
          isAuthenticated: false,
          mfaData: null,

          resetEmailOrMobile: null,
          resetToken: null,

          onboardingPending: false,
          hasActivePlan: false,
          role: null,
        });
      },

      setHasActivePlan: (hasActivePlan) => {
        set({ hasActivePlan });
      },

      setRole: (role) => {
        set({ role });
      },

      setOnboardingPending: (pending) => {
        set({
          onboardingPending: pending,
        });
      },

      setResetEmailOrMobile: (emailOrMobile) => {
        set({
          resetEmailOrMobile: emailOrMobile,
        });
      },

      setResetToken: (token) => {
        set({
          resetToken: token,
        });
      },

      clearResetData: () => {
        set({
          resetEmailOrMobile: null,
          resetToken: null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_SESSION,
    },
  ),
);
