import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PublicLayout } from '@app/layouts/PublicLayout';
import { ROUTES } from '@constants/routes';

jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: false, isProd: true },
}));

describe('PublicLayout', () => {
  it('renders the app name, auth nav links, and the matched child route via Outlet', () => {
    const router = createMemoryRouter(
      [
        {
          element: <PublicLayout />,
          children: [{ path: '/pricing', element: <div>Marketing page marker</div> }],
        },
      ],
      { initialEntries: ['/pricing'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Axiora Pulse')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', ROUTES.LOGIN);
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      ROUTES.REGISTER,
    );
    expect(screen.getByText('Marketing page marker')).toBeInTheDocument();
  });

  it('links the brand/logo back to home', () => {
    const router = createMemoryRouter(
      [
        {
          element: <PublicLayout />,
          children: [{ path: '/pricing', element: <div>Marketing page marker</div> }],
        },
      ],
      { initialEntries: ['/pricing'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: /Axiora Pulse/ })).toHaveAttribute('href', ROUTES.HOME);
  });
});
