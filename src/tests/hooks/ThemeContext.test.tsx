import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ThemeContext, type ThemeContextValue } from '@app/providers/ThemeContext';
import { useTheme } from '@hooks/useTheme';

describe('ThemeContext / useTheme', () => {
  it('falls back gracefully to the theme store when used outside of a ThemeContext provider', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
    expect(result.current.resolvedTheme).toBeDefined();
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('returns the provided context value when rendered within a provider', () => {
    const value: ThemeContextValue = {
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: jest.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toBe(value);
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('exposes a setTheme function reachable through the context value', () => {
    const setTheme = jest.fn();
    const value: ThemeContextValue = {
      theme: 'light',
      resolvedTheme: 'light',
      setTheme,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    result.current.setTheme('dark');

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
