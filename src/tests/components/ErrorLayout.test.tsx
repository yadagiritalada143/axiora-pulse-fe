import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { ErrorLayout } from '@app/layouts/ErrorLayout';

jest.mock('@config/env', () => ({
  env: { enableLogger: false },
}));

function ThrowingChild(): never {
  throw new Error('Route blew up');
}

describe('ErrorLayout', () => {
  it('renders the global error fallback with the caught route error', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <ThrowingChild />,
          errorElement: <ErrorLayout />,
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Route blew up')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('falls back to a generic message when the caught error is not an Error instance', () => {
    function ThrowingNonError(): never {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- exercising the non-Error branch
      throw 'not an Error object';
    }

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <ThrowingNonError />,
          errorElement: <ErrorLayout />,
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });
});
