import { MantineProvider as MantineProviderBase } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/theme/tokens.css';
import '@styles/mantine-calendar.css';

import { theme } from '@/theme';
import { useThemeStore } from '@store/theme.store';

interface MantineProviderProps {
  children: ReactNode;
}

export function MantineProvider({ children }: MantineProviderProps) {
  const currentTheme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const isDark =
      currentTheme === 'dark' ||
      (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const colorScheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
  }, [currentTheme]);

  return (
    <MantineProviderBase
      theme={theme}
      defaultColorScheme="auto"
      forceColorScheme={
        currentTheme === 'system' ? undefined : currentTheme === 'dark' ? 'dark' : 'light'
      }
    >
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProviderBase>
  );
}

export default MantineProvider;
