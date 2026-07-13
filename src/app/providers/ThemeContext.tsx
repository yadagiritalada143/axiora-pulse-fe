import { createContext } from 'react';

import type { Theme } from '@constants/theme';

export interface ThemeContextValue {
  /** The user's stored preference - "light" | "dark" | "system". */
  theme: Theme;
  /** The theme actually applied to the DOM, with "system" resolved to light/dark. */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
