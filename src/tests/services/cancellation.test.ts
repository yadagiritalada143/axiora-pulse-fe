import { createCancellable } from '@services/api/cancellation';

describe('createCancellable', () => {
  it('returns a signal that is not aborted initially', () => {
    const { signal } = createCancellable();

    expect(signal.aborted).toBe(false);
  });

  it('aborts the signal when cancel() is called', () => {
    const { signal, cancel } = createCancellable();

    cancel();

    expect(signal.aborted).toBe(true);
  });

  it('propagates an optional reason to the abort event', () => {
    const { signal, cancel } = createCancellable();
    const onAbort = jest.fn();
    signal.addEventListener('abort', onAbort);

    cancel('user navigated away');

    expect(onAbort).toHaveBeenCalledTimes(1);
    expect(signal.reason).toBe('user navigated away');
  });

  it('produces independent controllers across calls', () => {
    const first = createCancellable();
    const second = createCancellable();

    first.cancel();

    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(false);
  });
});
