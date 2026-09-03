import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';

import { ChangePasswordDialog } from '@features/settings/components/ChangePasswordDialog';
import { useChangePassword } from '@features/settings/hooks/useChangePassword';

jest.mock('@features/settings/hooks/useChangePassword', () => ({
  useChangePassword: jest.fn(),
}));

const mockedUseChangePassword = useChangePassword as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const mutate = jest.fn();

beforeEach(() => {
  mockedUseChangePassword.mockReturnValue({
    mutate,
    isPending: false,
    reset: jest.fn(),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ChangePasswordDialog', () => {
  it('renders when open is true', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(createElement(ChangePasswordDialog, { open: false, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('displays all password field labels', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('displays dialog description text', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('Keep your account safe with a strong password')).toBeInTheDocument();
  });

  it('shows current password as password type by default', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText('Current Password')).toHaveAttribute('type', 'password');
  });

  it('shows new password as password type by default', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'password');
  });

  it('shows confirm password as password type by default', () => {
    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute('type', 'password');
  });

  it('toggles current password visibility on eye button click', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    const toggleBtn = screen.getByRole('button', { name: 'Show current password' });
    await testUser.click(toggleBtn);

    expect(screen.getByLabelText('Current Password')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide current password' })).toBeInTheDocument();
  });

  it('toggles new password visibility on eye button click', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.click(screen.getByRole('button', { name: 'Show new password' }));
    expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'text');
  });

  it('toggles confirm password visibility on eye button click', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.click(screen.getByRole('button', { name: 'Show confirm password' }));
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute('type', 'text');
  });

  it('shows validation error when current password is empty', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('Current password is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when new password is too short', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'short');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(
      await screen.findByText('Password must be at least 8 characters long'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when new password has no uppercase', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'lowercase1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(
      await screen.findByText('Must contain at least one uppercase letter'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when new password has no lowercase', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'UPPERCASE1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(
      await screen.findByText('Must contain at least one lowercase letter'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when new password has no number', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NoNumber!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('Must contain at least one number')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when new password has no special character', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NoSpecial1');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(
      await screen.findByText('Must contain at least one special character (!@#$%^&*)'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when confirm password does not match', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NewPass1!');
    await testUser.type(screen.getByLabelText('Confirm New Password'), 'Different1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('calls mutate with correct payload on valid submission', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NewPass1!');
    await testUser.type(screen.getByLabelText('Confirm New Password'), 'NewPass1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(mutate).toHaveBeenCalledWith(
      { current_password: 'OldPass1!', new_password: 'NewPass1!' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const testUser = userEvent.setup();
    const onOpenChange = jest.fn();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange }), {
      wrapper: createWrapper(),
    });

    await testUser.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets form and closes dialog on successful mutation', async () => {
    const testUser = userEvent.setup();
    const onOpenChange = jest.fn();
    const resetFn = jest.fn();
    mockedUseChangePassword.mockReturnValue({
      mutate: jest.fn((_payload: unknown, options: { onSuccess: () => void }) => {
        options.onSuccess();
      }),
      isPending: false,
      reset: resetFn,
    });

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NewPass1!');
    await testUser.type(screen.getByLabelText('Confirm New Password'), 'NewPass1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables submit button while mutation is pending', () => {
    mockedUseChangePassword.mockReturnValue({
      mutate,
      isPending: true,
      reset: jest.fn(),
    });

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('button', { name: 'Update Password' })).toBeDisabled();
  });

  it('disables Cancel button while mutation is pending', () => {
    mockedUseChangePassword.mockReturnValue({
      mutate,
      isPending: true,
      reset: jest.fn(),
    });

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('shows validation error when confirm password is empty', async () => {
    const testUser = userEvent.setup();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange: jest.fn() }), {
      wrapper: createWrapper(),
    });

    await testUser.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await testUser.type(screen.getByLabelText('New Password'), 'NewPass1!');
    await testUser.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('Please confirm your new password')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('calls onOpenChange with true when dialog overlay is clicked', () => {
    const onOpenChange = jest.fn();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange }), {
      wrapper: createWrapper(),
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('resets form when dialog is closed via onOpenChange', () => {
    const onOpenChange = jest.fn();

    render(createElement(ChangePasswordDialog, { open: true, onOpenChange }), {
      wrapper: createWrapper(),
    });

    expect(screen.getByLabelText('Current Password')).toHaveValue('');
  });
});
