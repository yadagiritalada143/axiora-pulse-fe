import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from '@hooks/useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('falls back to the provided default when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('missing-key', 'default-value'));

    expect(result.current[0]).toBe('default-value');
  });

  it('reads the initial value from localStorage when present', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('existing-key', 'default-value'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('persists a new value to localStorage and updates the returned value', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(JSON.parse(localStorage.getItem('counter') ?? 'null')).toBe(5);
  });

  it('supports functional updates based on the previous value', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 1));

    act(() => {
      result.current[1]((previous) => previous + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(JSON.parse(localStorage.getItem('counter') ?? 'null')).toBe(2);
  });
});
