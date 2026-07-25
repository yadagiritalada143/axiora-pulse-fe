import { createCancellable } from '@services/api/cancellation';

describe('createCancellable', () => {
  it('returns a signal that is not aborted initially', () => {
    const { signal } = createCancellable();
    expect(signal.aborted).toBe(false);
  });

  it('aborts the signal when cancel is called', () => {
    const { signal, cancel } = createCancellable();

    cancel('stop');

    expect(signal.aborted).toBe(true);
  });
});
