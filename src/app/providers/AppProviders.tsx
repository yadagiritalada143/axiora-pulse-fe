import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Toaster } from '@components/ui/sonner';
import { TooltipProvider } from '@components/ui/tooltip';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

/**
 * Single composition root for every app-wide provider. Order matters:
 * Theme must wrap Toaster (reads resolved theme); Query must wrap Auth
 * (auth mutations are TanStack Query mutations).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MantineProvider defaultColorScheme="auto">
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </MantineProvider>
    </ThemeProvider>
  );
}
