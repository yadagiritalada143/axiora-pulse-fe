import { act } from '@testing-library/react';

import { useThemeStore } from '@store/theme.store';

const initialState = useThemeStore.getState();

describe('useThemeStore', () => {
  afterEach(() => {
    act(() => {
      useThemeStore.setState(initialState, true);
    });
    localStorage.clear();
  });

  it('defaults to the "system" theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('setTheme updates the theme', () => {
    act(() => {
      useThemeStore.getState().setTheme('dark');
    });

    expect(useThemeStore.getState().theme).toBe('dark');

    act(() => {
      useThemeStore.getState().setTheme('light');
    });

    expect(useThemeStore.getState().theme).toBe('light');
  });
});
