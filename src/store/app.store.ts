import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@constants/storage';

interface AppState {
  activeWorkspaceId: string | null;
  isOnboarded: boolean;
}

interface AppActions {
  setActiveWorkspaceId: (id: string | null) => void;
  setOnboarded: (isOnboarded: boolean) => void;
}

/** Cross-cutting app-level client state that isn't tied to one feature. */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      isOnboarded: false,

      setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
    }),
    { name: STORAGE_KEYS.ACTIVE_WORKSPACE },
  ),
);
