import { act } from '@testing-library/react';

import { useAppStore } from '@store/app.store';

const initialState = useAppStore.getState();

describe('useAppStore', () => {
  afterEach(() => {
    act(() => {
      useAppStore.setState(initialState, true);
    });
    localStorage.clear();
  });

  it('has the expected default state', () => {
    expect(useAppStore.getState().activeWorkspaceId).toBeNull();
    expect(useAppStore.getState().isOnboarded).toBe(false);
  });

  it('setActiveWorkspaceId updates the active workspace id', () => {
    act(() => {
      useAppStore.getState().setActiveWorkspaceId('workspace-1');
    });

    expect(useAppStore.getState().activeWorkspaceId).toBe('workspace-1');
  });

  it('setActiveWorkspaceId can clear the active workspace id', () => {
    act(() => {
      useAppStore.getState().setActiveWorkspaceId('workspace-1');
      useAppStore.getState().setActiveWorkspaceId(null);
    });

    expect(useAppStore.getState().activeWorkspaceId).toBeNull();
  });

  it('setOnboarded updates the onboarded flag', () => {
    act(() => {
      useAppStore.getState().setOnboarded(true);
    });

    expect(useAppStore.getState().isOnboarded).toBe(true);
  });
});
