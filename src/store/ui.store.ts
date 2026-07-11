import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeModal: string | null;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

/** Ephemeral, non-persisted UI chrome state - sidebar, modals, palettes. */
export const useUIStore = create<UIState & UIActions>((set) => ({
  isSidebarOpen: true,
  isCommandPaletteOpen: false,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}));
