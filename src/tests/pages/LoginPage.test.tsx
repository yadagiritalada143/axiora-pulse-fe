import { render, screen } from '@testing-library/react';

import LoginPage from '@pages/LoginPage';

jest.mock('@features/auth/components', () => ({
  LoginForm: () => <div>LoginForm stub</div>,
}));

describe('LoginPage', () => {
  it('renders the welcome heading, copy, and the login form', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue to your workspace.')).toBeInTheDocument();
    expect(screen.getByText('LoginForm stub')).toBeInTheDocument();
  });
});
