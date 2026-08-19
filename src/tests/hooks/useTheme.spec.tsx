import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ThemeContext, type ThemeContextValue } from '@app/providers/ThemeContext';
import { useTheme } from '@hooks/useTheme';

describe('useTheme', () => {
  it('returns the theme context value when inside a provider', () => {
    const value: ThemeContextValue = {
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    };
    function Wrapper({ children }: { children: ReactNode }) {
      return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
    }

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current).toBe(value);
  });

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
  });
});
