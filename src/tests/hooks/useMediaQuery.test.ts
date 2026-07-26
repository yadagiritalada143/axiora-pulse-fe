import { act, renderHook } from '@testing-library/react';

import { useMediaQuery } from '@hooks/useMediaQuery';

type Listener = (event?: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let changeListener: Listener | null = null;

  const mql = {
    get matches() {
      return matches;
    },
    media: '',
    addEventListener: jest.fn((event: string, listener: Listener) => {
      if (event === 'change') {
        changeListener = listener;
      }
    }),
    removeEventListener: jest.fn(),
  };

  window.matchMedia = jest.fn().mockReturnValue(mql);

  return {
    setMatches: (next: boolean) => {
      matches = next;
      changeListener?.();
    },
    mql,
  };
}

describe('useMediaQuery', () => {
  it('returns the current matchMedia result', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns false when the query does not match', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('updates when the registered change listener fires', () => {
    const { setMatches } = mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it('registers and cleans up the change listener on unmount', () => {
    const { mql } = mockMatchMedia(false);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
