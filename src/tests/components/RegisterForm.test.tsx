import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { RegisterForm } from '@features/auth/components/RegisterForm';
import { useRegister } from '@features/auth/hooks';

jest.mock('@features/auth/hooks', () => ({
  useRegister: jest.fn(),
}));

const mockedUseRegister = jest.mocked(useRegister);
const mutate = jest.fn();

type UseRegisterReturn = ReturnType<typeof useRegister>;

function mockUseRegisterReturn(overrides: Partial<UseRegisterReturn> = {}) {
  mockedUseRegister.mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as UseRegisterReturn);
}

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRegisterReturn();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid username format', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email / Mobile Number'), 'nope');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText('Enter a valid email address or mobile number'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the correctly-shaped payload for a valid registration', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email / Mobile Number'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        username: 'jane@example.com',
        password: 'password123',
      }),
    );
  });

  it('disables the submit button and shows a loader while pending', () => {
    mockUseRegisterReturn({ isPending: true });
    renderForm();

    const button = screen.getByRole('button', { name: /create account/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
