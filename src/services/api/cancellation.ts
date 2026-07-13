/**
 * Creates an AbortController and a matching axios `signal` config. Pass the
 * returned `signal` into a request's config, and call `cancel()` (e.g. from a
 * `useEffect` cleanup or a "stop generating" button) to abort it in flight.
 */
export function createCancellable() {
  const controller = new AbortController();

  return {
    signal: controller.signal,
    cancel: (reason?: string) => controller.abort(reason),
  };
}
