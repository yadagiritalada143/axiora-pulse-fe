import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AdminDashboardLayout } from '@app/layouts/AdminDashboardLayout';

// MentorShell pulls in the auth store, dropdown menus and navigation chrome that are
// unrelated to what AdminDashboardLayout itself is responsible for (wiring the Outlet).
jest.mock('@features/ideaValidation/components', () => ({
  MentorShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="mentor-shell">{children}</div>
  ),
}));

describe('AdminDashboardLayout', () => {
  it('renders the matched admin child route inside MentorShell', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AdminDashboardLayout />,
          children: [{ path: '/', element: <div>Admin page marker</div> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
    expect(screen.getByText('Admin page marker')).toBeInTheDocument();
  });
});
