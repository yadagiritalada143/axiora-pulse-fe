import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/api.types';
import { STORAGE_KEYS } from '@constants/storage';
import { tokenManager } from '@services/api/tokenManager';

export interface MFAData {
  userid: number;
  username: string;
  mfaVerified: boolean;
  flow: 'register' | 'login';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaData: MFAData | null;
}

interface AuthActions {
  setMfaData: (data: MFAData) => void;
  setAuthenticated: (jwt: string) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,

      isAuthenticated: false,

      mfaData: null,

      setMfaData: (data) => {
        set({
          mfaData: data,
        });
      },

      setAuthenticated: (jwt) => {
        tokenManager.setTokens(jwt);

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
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_SESSION,
    },
  ),
);
