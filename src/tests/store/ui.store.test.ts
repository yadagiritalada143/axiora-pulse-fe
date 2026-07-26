import { act } from '@testing-library/react';

import { useUIStore } from '@store/ui.store';

const initialState = useUIStore.getState();

describe('useUIStore', () => {
  afterEach(() => {
    act(() => {
      useUIStore.setState(initialState, true);
    });
  });

  it('has the expected default state', () => {
    const state = useUIStore.getState();
    expect(state.isSidebarOpen).toBe(true);
    expect(state.isCommandPaletteOpen).toBe(false);
    expect(state.activeModal).toBeNull();
  });

  it('toggleSidebar flips the sidebar open state', () => {
    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().isSidebarOpen).toBe(false);

    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().isSidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets the sidebar state explicitly', () => {
    act(() => {
      useUIStore.getState().setSidebarOpen(false);
    });

    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('setCommandPaletteOpen sets the command palette state', () => {
    act(() => {
      useUIStore.getState().setCommandPaletteOpen(true);
    });

    expect(useUIStore.getState().isCommandPaletteOpen).toBe(true);
  });

  it('openModal sets the active modal id', () => {
    act(() => {
      useUIStore.getState().openModal('settings');
    });

    expect(useUIStore.getState().activeModal).toBe('settings');
  });

  it('closeModal clears the active modal', () => {
    act(() => {
      useUIStore.getState().openModal('settings');
      useUIStore.getState().closeModal();
    });

    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
