import { render, screen } from '@testing-library/react';

import AdminUsersPage from '@pages/AdminUsersPage';

// AdminUsersTable has its own dedicated tests; stub it here so this page test only
// verifies composition (the table being rendered).
jest.mock('@features/admin/components', () => ({
  AdminUsersTable: () => <div data-testid="admin-users-table" />,
}));

describe('AdminUsersPage', () => {
  it('renders the users table', () => {
    render(<AdminUsersPage />);

    expect(screen.getByTestId('admin-users-table')).toBeInTheDocument();
  });
});
