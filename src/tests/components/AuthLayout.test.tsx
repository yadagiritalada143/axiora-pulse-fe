import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AuthLayout } from '@app/layouts/AuthLayout';

describe('AuthLayout', () => {
  it('renders the shared hero copy and the matched child route via Outlet', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AuthLayout />,
          children: [{ path: '/', element: <div>Login form marker</div> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { name: /Turn Ideas into Business Model/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Login form marker')).toBeInTheDocument();
    expect(screen.getByText('Privacy policy')).toBeInTheDocument();
    expect(screen.getByText('Legal terms')).toBeInTheDocument();
  });
});
