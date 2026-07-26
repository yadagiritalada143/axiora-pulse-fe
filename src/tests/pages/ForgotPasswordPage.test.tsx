import { render, screen } from '@testing-library/react';

import ForgotPasswordPage from '@pages/ForgotPasswordPage';

jest.mock('@features/auth/components', () => ({
  ForgotPasswordForm: () => <div>ForgotPasswordForm stub</div>,
}));

describe('ForgotPasswordPage', () => {
  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('ForgotPasswordForm stub')).toBeInTheDocument();
  });
});
