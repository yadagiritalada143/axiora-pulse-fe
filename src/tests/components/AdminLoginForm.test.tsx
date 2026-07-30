import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { AdminLoginForm } from '@features/auth/components/AdminLoginForm';
import { useAdminLogin } from '@features/auth/hooks';

jest.mock('@features/auth/hooks', () => ({
  useAdminLogin: jest.fn(),
}));

const mockedUseAdminLogin = jest.mocked(useAdminLogin);
const mutate = jest.fn();

type UseAdminLoginReturn = ReturnType<typeof useAdminLogin>;

function mockUseAdminLoginReturn(overrides: Partial<UseAdminLoginReturn> = {}) {
  mockedUseAdminLogin.mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as UseAdminLoginReturn);
}

function renderForm() {
  return render(
    <MemoryRouter>
      <AdminLoginForm />
    </MemoryRouter>,
  );
}

describe('AdminLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminLoginReturn();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid admin email', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Admin Email'), 'not-an-email-or-phone');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('Enter a valid email address or mobile number'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the correctly-shaped payload for a valid admin login', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        username: 'admin@example.com',
        password: 'password123',
      }),
    );
  });

  it('disables the submit button and shows a loader while pending', () => {
    mockUseAdminLoginReturn({ isPending: true });
    renderForm();

    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
