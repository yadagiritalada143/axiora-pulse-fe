import { MantineProvider } from '@mantine/core';
import { GoogleOAuthProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Toaster } from '@components/ui/sonner';
import { TooltipProvider } from '@components/ui/tooltip';
import { appConfig } from '@config/app.config';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

/**
 * Wraps children in Google's OAuth context only when a client ID is configured.
 * Without a client ID the "Continue with Google" button hides itself, so there
 * is no need to mount the provider (which would warn on an empty clientId).
 */
function GoogleAuthProvider({ children }: { children: ReactNode }) {
  if (!appConfig.googleClientId) {
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={appConfig.googleClientId}>{children}</GoogleOAuthProvider>;
}

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
            <GoogleAuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </GoogleAuthProvider>
          </AuthProvider>
        </QueryProvider>
      </MantineProvider>
    </ThemeProvider>
  );
}
