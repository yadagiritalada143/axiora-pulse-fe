import { debounce, sleep, throttle } from '@utils/timing';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only invokes the callback once after the wait period', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 200);

    debounced();
    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('invokes immediately then ignores calls within the window', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 200);

    throttled();
    throttled();
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(200);
    throttled();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    jest.useFakeTimers();
    const promise = sleep(100);
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});
