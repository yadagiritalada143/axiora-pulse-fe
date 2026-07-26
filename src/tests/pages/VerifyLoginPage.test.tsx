import { render, screen } from '@testing-library/react';

import VerifyLoginPage from '@pages/VerifyLoginPage';

jest.mock('@/features/auth/components/VerifyLoginForm', () => ({
  VerifyLoginForm: () => <div>VerifyLoginForm stub</div>,
}));

describe('VerifyLoginPage', () => {
  it('renders the verify login form', () => {
    render(<VerifyLoginPage />);

    expect(screen.getByText('VerifyLoginForm stub')).toBeInTheDocument();
  });
});
