import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { LoginForm } from '@features/auth/components/LoginForm';
import { useLogin } from '@features/auth/hooks';

jest.mock('@features/auth/hooks', () => ({
  useLogin: jest.fn(),
}));

const mockedUseLogin = jest.mocked(useLogin);
const mutate = jest.fn();

type UseLoginReturn = ReturnType<typeof useLogin>;

function mockUseLoginReturn(overrides: Partial<UseLoginReturn> = {}) {
  mockedUseLogin.mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as UseLoginReturn);
}

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLoginReturn();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /get started/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid username', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email/Mobile Number'), 'not-an-email-or-phone');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /get started/i }));

    expect(
      await screen.findByText('Enter a valid email address or mobile number'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the correctly-shaped payload for a valid login', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email/Mobile Number'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByLabelText('Remember me'));
    await user.click(screen.getByRole('button', { name: /get started/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        username: 'jane@example.com',
        password: 'password123',
        remember: true,
      }),
    );
  });

  it('disables the submit button and shows a loader while pending', () => {
    mockUseLoginReturn({ isPending: true });
    renderForm();

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
