import { render, screen } from '@testing-library/react';

import AdminLoginPage from '@pages/AdminLoginPage';

// AdminLoginForm has its own dedicated tests; stub it here so this page test only
// verifies composition (heading/copy + the form being rendered), not form behavior.
jest.mock('@features/auth/components', () => ({
  AdminLoginForm: () => <div data-testid="admin-login-form" />,
}));

describe('AdminLoginPage', () => {
  it('renders the admin login heading, description, and the login form', () => {
    render(<AdminLoginPage />);

    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to access the admin dashboard.')).toBeInTheDocument();
    expect(screen.getByTestId('admin-login-form')).toBeInTheDocument();
  });
});
