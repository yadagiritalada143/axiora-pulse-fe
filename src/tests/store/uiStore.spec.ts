import { useUIStore } from '@store/ui.store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      isSidebarOpen: true,
      isCommandPaletteOpen: false,
      activeModal: null,
    });
  });

  it('toggles the sidebar', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
  });

  it('sets the sidebar open state explicitly', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('sets the command palette open state', () => {
    useUIStore.getState().setCommandPaletteOpen(true);
    expect(useUIStore.getState().isCommandPaletteOpen).toBe(true);
  });

  it('opens and closes a modal', () => {
    useUIStore.getState().openModal('confirm');
    expect(useUIStore.getState().activeModal).toBe('confirm');

    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
