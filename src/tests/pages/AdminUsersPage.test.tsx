import { render, screen } from '@testing-library/react';

import AdminUsersPage from '@pages/AdminUsersPage';

// AdminUsersTable has its own dedicated tests; stub it here so this page test only
// verifies composition (heading/description + the table being rendered).
jest.mock('@features/admin/components', () => ({
  AdminUsersTable: () => <div data-testid="admin-users-table" />,
}));

describe('AdminUsersPage', () => {
  it('renders the page header and the users table', () => {
    render(<AdminUsersPage />);

    expect(screen.getByRole('heading', { name: 'Registered Users' })).toBeInTheDocument();
    expect(
      screen.getByText('View and manage all registered users in Axiora Pulse.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('admin-users-table')).toBeInTheDocument();
  });
});
