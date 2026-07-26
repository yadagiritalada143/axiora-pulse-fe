import { render, screen } from '@testing-library/react';

import { QueryProvider } from '@app/providers/QueryProvider';

// Isolated in its own file (rather than jest.resetModules() mid-test) since Jest gives each
// test file a fresh module registry - swapping @config/env's isDev here can't collide with
// React's own module instance the way an in-file resetModules() would.
jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: true, isProd: false },
}));

describe('QueryProvider (isDev)', () => {
  it('renders the React Query devtools when running in dev mode', () => {
    render(
      <QueryProvider>
        <div>child</div>
      </QueryProvider>,
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
