import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from '@hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('reads an existing stored value', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('sets a new value and persists it', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    act(() => result.current[1]('updated'));

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('key')).toBe(JSON.stringify('updated'));
  });

  it('supports a functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1));

    act(() => result.current[1]((previous) => previous + 1));

    expect(result.current[0]).toBe(2);
  });
});
