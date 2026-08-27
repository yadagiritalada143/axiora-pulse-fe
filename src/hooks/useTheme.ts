import { useContext } from 'react';

import { ThemeContext } from '@app/providers/ThemeContext';
import { useThemeStore } from '@store/theme.store';

export function useTheme() {
  const context = useContext(ThemeContext);
  const storeTheme = useThemeStore((state) => state.theme);
  const setStoreTheme = useThemeStore((state) => state.setTheme);

  if (context) {
    return context;
  }

  const fallbackResolved: 'light' | 'dark' = storeTheme === 'system' ? 'light' : storeTheme;

  return {
    theme: storeTheme,
    resolvedTheme: fallbackResolved,
    setTheme: setStoreTheme,
  };
}
