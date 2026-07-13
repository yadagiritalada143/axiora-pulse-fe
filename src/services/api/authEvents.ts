type AuthEvent = 'session-expired';
type AuthEventHandler = () => void;

/**
 * Tiny pub/sub so the axios layer can announce a forced logout without
 * importing Zustand or React Router directly (both are UI-layer concerns).
 * `AuthProvider` subscribes once and clears the session / redirects.
 */
const handlers = new Set<AuthEventHandler>();

export const authEvents = {
  on(_event: AuthEvent, handler: AuthEventHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },
  emit(_event: AuthEvent): void {
    handlers.forEach((handler) => handler());
  },
};
