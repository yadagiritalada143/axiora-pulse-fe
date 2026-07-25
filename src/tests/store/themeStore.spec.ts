import { useThemeStore } from '@store/theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' });
  });

  it('defaults to the system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('updates the theme', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
