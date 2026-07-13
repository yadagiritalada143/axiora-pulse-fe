/**
 * Coalesces concurrent 401s into a single `/auth/refresh` call. Every request
 * that fails while a refresh is already in flight awaits the same promise
 * instead of triggering its own refresh (which would race and invalidate
 * tokens).
 */
let refreshPromise: Promise<string> | null = null;

export function runExclusiveRefresh(refresh: () => Promise<string>): Promise<string> {
  refreshPromise ??= refresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
