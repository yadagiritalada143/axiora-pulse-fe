import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';

import { App } from '@app/App';

// App.tsx is a thin composition root (ErrorBoundary + AppProviders + RouterProvider).
// Stub out the real provider stack and router so this is a focused smoke test of the
// composition itself, not a re-test of AppProviders/router internals (covered elsewhere).
jest.mock('@app/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@app/router', () => ({
  router: undefined,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof ReactRouterDom>('react-router-dom'),
  RouterProvider: () => <div>Router mounted</div>,
}));

describe('App', () => {
  it('renders without throwing, composing ErrorBoundary, AppProviders and RouterProvider', () => {
    render(<App />);

    expect(screen.getByText('Router mounted')).toBeInTheDocument();
  });
});
