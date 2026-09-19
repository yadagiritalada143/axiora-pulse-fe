import { GoogleOAuthProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';

import { Toaster } from '@components/ui/sonner';
import { TooltipProvider } from '@components/ui/tooltip';
import { appConfig } from '@config/app.config';

import { AuthProvider } from './AuthProvider';
import { MantineProvider } from './MantineProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

function GoogleAuthProvider({ children }: { children: ReactNode }) {
  if (!appConfig.googleClientId) {
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={appConfig.googleClientId}>{children}</GoogleOAuthProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MantineProvider>
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
