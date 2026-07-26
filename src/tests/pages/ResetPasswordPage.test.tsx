import { render, screen } from '@testing-library/react';

import ResetPasswordPage from '@pages/ResetPasswordPage';

jest.mock('@features/auth/components', () => ({
  ResetPasswordForm: () => <div>ResetPasswordForm stub</div>,
}));

describe('ResetPasswordPage', () => {
  it('renders the heading, copy, and the reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByRole('heading', { name: 'Set a new password' })).toBeInTheDocument();
    expect(
      screen.getByText("Choose a strong password you haven't used before."),
    ).toBeInTheDocument();
    expect(screen.getByText('ResetPasswordForm stub')).toBeInTheDocument();
  });
});
