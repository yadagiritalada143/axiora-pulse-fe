import { render, screen } from '@testing-library/react';

import RegisterPage from '@pages/RegisterPage';

jest.mock('@features/auth/components', () => ({
  RegisterForm: () => <div>RegisterForm stub</div>,
}));

describe('RegisterPage', () => {
  it('renders the get-started heading, app-name copy, and the register form', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Axiora Pulse/)).toBeInTheDocument();
    expect(screen.getByText('RegisterForm stub')).toBeInTheDocument();
  });
});
