import { useAppStore } from '@store/app.store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ activeWorkspaceId: null, isOnboarded: false });
  });

  it('sets the active workspace id', () => {
    useAppStore.getState().setActiveWorkspaceId('ws-1');
    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-1');

    useAppStore.getState().setActiveWorkspaceId(null);
    expect(useAppStore.getState().activeWorkspaceId).toBeNull();
  });

  it('sets the onboarded flag', () => {
    useAppStore.getState().setOnboarded(true);
    expect(useAppStore.getState().isOnboarded).toBe(true);
  });
});
