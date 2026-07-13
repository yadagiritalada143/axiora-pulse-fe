import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/api.types';
import { STORAGE_KEYS } from '@constants/storage';
import { tokenManager } from '@services/api/tokenManager';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setSession: (session: { user: User; accessToken: string; refreshToken: string }) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
}

/**
 * Reactive mirror of the auth session for UI reads. Raw tokens are owned by
 * `tokenManager` (read directly by the axios interceptors, which run outside
 * React) - this store only persists the `user`/`isAuthenticated` shape so the
 * UI can hydrate instantly on reload without re-fetching `/auth/me`.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setSession: ({ user, accessToken, refreshToken }) => {
        tokenManager.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),

      clearSession: () => {
        tokenManager.clearTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: STORAGE_KEYS.AUTH_SESSION },
  ),
);
