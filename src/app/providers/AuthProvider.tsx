import { useEffect, type ReactNode } from 'react';

import { authEvents } from '@services/api';
import { useAuthStore } from '@store/auth.store';

/**
 * Bridges the store-agnostic axios layer back into React state: when the
 * refresh-token flow gives up (see `services/api/client.ts`), this clears the
 * session so route guards immediately redirect to `/login`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => authEvents.on('session-expired', clearSession), [clearSession]);

  return <>{children}</>;
}
