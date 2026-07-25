import { act, renderHook } from '@testing-library/react';

import { useMediaQuery } from '@hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let changeHandler: () => void = () => undefined;

  const mql = {
    matches: false,
    media: '(min-width: 768px)',
    onchange: null,
    addEventListener: (_type: string, cb: () => void) => {
      changeHandler = cb;
    },
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  beforeEach(() => {
    mql.matches = false;
    window.matchMedia = jest.fn().mockReturnValue(mql);
  });

  it('returns the initial match state', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates when the media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    act(() => {
      mql.matches = true;
      changeHandler();
    });

    expect(result.current).toBe(true);
  });
});
