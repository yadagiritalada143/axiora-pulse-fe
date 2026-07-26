import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { AppProviders } from '@app/providers/AppProviders';
import { useTheme } from '@hooks/useTheme';

jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: false, isProd: true },
}));

beforeEach(() => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    media: '(prefers-color-scheme: dark)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
});

function ContextProbe() {
  // Throws if not rendered under QueryClientProvider / ThemeProvider respectively.
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  return (
    <div>
      Context ok: {queryClient ? 'query' : 'no-query'}, theme: {resolvedTheme}
    </div>
  );
}

describe('AppProviders', () => {
  it('renders its children', () => {
    render(
      <AppProviders>
        <div>App child content</div>
      </AppProviders>,
    );

    expect(screen.getByText('App child content')).toBeInTheDocument();
  });

  it('nests Theme, Query and Auth providers so descendants can resolve their contexts', () => {
    render(
      <AppProviders>
        <ContextProbe />
      </AppProviders>,
    );

    expect(screen.getByText('Context ok: query, theme: light')).toBeInTheDocument();
  });
});
