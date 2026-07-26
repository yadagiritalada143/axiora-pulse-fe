import { act, render, screen } from '@testing-library/react';

import { ThemeProvider } from '@app/providers/ThemeProvider';
import { useTheme } from '@hooks/useTheme';
import { useThemeStore } from '@store/theme.store';

jest.mock('@store/theme.store', () => ({
  useThemeStore: jest.fn(),
}));

const mockUseThemeStore = useThemeStore as unknown as jest.Mock;

type MatchMediaListener = () => void;

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<MatchMediaListener>();

  const mql = {
    get matches() {
      return matches;
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_event: string, handler: MatchMediaListener) => {
      listeners.add(handler);
    },
    removeEventListener: (_event: string, handler: MatchMediaListener) => {
      listeners.delete(handler);
    },
  };

  window.matchMedia = jest.fn().mockReturnValue(mql);

  return {
    setMatches: (value: boolean) => {
      matches = value;
      listeners.forEach((listener) => listener());
    },
    listenerCount: () => listeners.size,
  };
}

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      theme: {theme}, resolved: {resolvedTheme}
    </div>
  );
}

function setThemeState(theme: 'light' | 'dark' | 'system', setTheme = jest.fn()) {
  mockUseThemeStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ theme, setTheme }),
  );
  return setTheme;
}

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    jest.clearAllMocks();
  });

  it('applies the dark class and color-scheme for the "dark" theme', () => {
    installMatchMedia(false);
    setThemeState('dark');

    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('removes the dark class and sets light color-scheme for the "light" theme', () => {
    installMatchMedia(true);
    setThemeState('light');

    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('resolves "system" to dark when matchMedia reports a dark preference', () => {
    installMatchMedia(true);
    setThemeState('system');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByText('theme: system, resolved: dark')).toBeInTheDocument();
  });

  it('resolves "system" to light when matchMedia reports a light preference', () => {
    installMatchMedia(false);
    setThemeState('system');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByText('theme: system, resolved: light')).toBeInTheDocument();
  });

  it('reacts to OS-level theme changes while on "system"', () => {
    const media = installMatchMedia(false);
    setThemeState('system');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('theme: system, resolved: light')).toBeInTheDocument();

    act(() => {
      media.setMatches(true);
    });

    expect(screen.getByText('theme: system, resolved: dark')).toBeInTheDocument();
  });

  it('exposes setTheme from the store through context', () => {
    installMatchMedia(false);
    const setTheme = setThemeState('light');

    function Setter() {
      const { setTheme: contextSetTheme } = useTheme();
      return (
        <button type="button" onClick={() => contextSetTheme('dark')}>
          Switch
        </button>
      );
    }

    render(
      <ThemeProvider>
        <Setter />
      </ThemeProvider>,
    );

    screen.getByRole('button', { name: 'Switch' }).click();
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('removes the matchMedia listener on unmount', () => {
    const media = installMatchMedia(false);
    setThemeState('system');

    const { unmount } = render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    expect(media.listenerCount()).toBe(1);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});
