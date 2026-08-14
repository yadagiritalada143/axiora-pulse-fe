let refreshPromise: Promise<string> | null = null;

export function runExclusiveRefresh(refresh: () => Promise<string>): Promise<string> {
  refreshPromise ??= refresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
