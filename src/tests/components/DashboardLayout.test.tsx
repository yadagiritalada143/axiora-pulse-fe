import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { DashboardLayout } from '@app/layouts/DashboardLayout';

// MentorShell pulls in the auth store, dropdown menus and navigation chrome that are
// unrelated to what DashboardLayout itself is responsible for (wiring the Outlet).
jest.mock('@features/ideaValidation/components', () => ({
  MentorShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="mentor-shell">{children}</div>
  ),
}));

describe('DashboardLayout', () => {
  it('renders the matched child route inside MentorShell', () => {
    const router = createMemoryRouter(
      [
        {
          element: <DashboardLayout />,
          children: [{ path: '/', element: <div>Dashboard page marker</div> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
    expect(screen.getByText('Dashboard page marker')).toBeInTheDocument();
  });
});
