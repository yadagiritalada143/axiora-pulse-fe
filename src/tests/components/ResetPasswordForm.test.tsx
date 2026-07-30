import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ResetPasswordForm } from '@features/auth/components/ResetPasswordForm';
import { useResetPassword } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/auth/hooks', () => ({
  useResetPassword: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@store/auth.store');

const mockedUseResetPassword = jest.mocked(useResetPassword);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastError = jest.mocked(toast.error);
const mutate = jest.fn();

type UseResetPasswordReturn = ReturnType<typeof useResetPassword>;

function mockUseResetPasswordReturn(overrides: Partial<UseResetPasswordReturn> = {}) {
  mockedUseResetPassword.mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as UseResetPasswordReturn);
}

function mockResetToken(resetToken: string | null) {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      user: null,
      isAuthenticated: false,
      mfaData: null,
      resetEmailOrMobile: null,
      resetToken,

      hasActivePlan: false,
      role: null,

      hasCompletedQuestionnaire: false,
      showQuestionnaireIntro: false,

      setMfaData: jest.fn(),
      setAuthenticated: jest.fn(),
      updateUser: jest.fn(),
      clearSession: jest.fn(),

      setResetEmailOrMobile: jest.fn(),
      setResetToken: jest.fn(),
      clearResetData: jest.fn(),

      setHasActivePlan: jest.fn(),
      setRole: jest.fn(),

      // NEW ACTIONS (if they exist in your store)
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    }),
  );
}

/**
 * The password fields are wrapped in an extra `<div>` (for the eye-icon toggle), which
 * breaks the FormControl -> Input `id`/`htmlFor` association (Radix Slot forwards the id
 * to its immediate child, the wrapper div, not the nested native input). So these fields
 * can't be queried via `getByLabelText` — query by the RHF-assigned `name` instead.
 */
function getInputByName(container: HTMLElement, name: string): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) {
    throw new Error(`Input with name "${name}" not found`);
  }
  return input;
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseResetPasswordReturn();
    mockResetToken('valid-reset-token');
  });

  it('shows a validation error when the new password is too short', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows a validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    await user.type(getInputByName(container, 'new_password'), 'password123');
    await user.type(getInputByName(container, 'confirmPassword'), 'differentPass1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the correctly-shaped payload for a valid, matching password', async () => {
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    await user.type(getInputByName(container, 'new_password'), 'password123');
    await user.type(getInputByName(container, 'confirmPassword'), 'password123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        reset_token: 'valid-reset-token',
        new_password: 'password123',
      }),
    );
  });

  it('shows a session-expired error and does not submit when there is no reset token', async () => {
    mockResetToken(null);
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    await user.type(getInputByName(container, 'new_password'), 'password123');
    await user.type(getInputByName(container, 'confirmPassword'), 'password123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() =>
      expect(mockedToastError).toHaveBeenCalledWith(
        'Session expired. Please start the forgot password flow again.',
      ),
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it('disables the submit button and shows a loader while pending', () => {
    mockUseResetPasswordReturn({ isPending: true });
    render(<ResetPasswordForm />);

    const button = screen.getByRole('button', { name: /reset password/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it("toggles the new password field's visibility via its own eye button", async () => {
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    const newPasswordInput = getInputByName(container, 'new_password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');

    const wrapper = newPasswordInput.closest('.relative');
    if (!wrapper) {
      throw new Error('Expected the password field to have a wrapping container');
    }
    const toggleButtons = Array.from(wrapper.querySelectorAll('button'));
    const lastToggleButton = toggleButtons.at(-1);
    if (!lastToggleButton) {
      throw new Error('Expected at least one visibility toggle button');
    }
    await user.click(lastToggleButton);

    expect(newPasswordInput).toHaveAttribute('type', 'text');
  });

  /**
   * The shared `Input` component (@components/ui/input) already renders its own built-in
   * password visibility toggle for `type="password"` fields, and ResetPasswordForm layers a
   * second, separate toggle (its own `showPassword`/`showConfirm` state) on top of that -
   * both buttons render stacked at the exact same position. This looks like an unintentional
   * duplicate control (worth a follow-up to remove one of them), but since it's not a
   * regression this change introduces, these tests target ResetPasswordForm's own outer
   * toggle buttons specifically (the ones with `tabIndex={-1}`) to cover its own state.
   */
  function getOwnToggleButton(container: HTMLElement, fieldName: string): HTMLButtonElement {
    const input = getInputByName(container, fieldName);
    const formControl = input.closest('[data-slot="form-control"]');
    if (!formControl) {
      throw new Error(`Expected a form-control wrapper for "${fieldName}"`);
    }
    const button = formControl.querySelector<HTMLButtonElement>('button[tabindex="-1"]');
    if (!button) {
      throw new Error(`Expected ResetPasswordForm's own toggle button for "${fieldName}"`);
    }
    return button;
  }

  it("toggles the new password field's visibility via ResetPasswordForm's own state", async () => {
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    const newPasswordInput = getInputByName(container, 'new_password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');

    await user.click(getOwnToggleButton(container, 'new_password'));

    expect(newPasswordInput).toHaveAttribute('type', 'text');
  });

  it("toggles the confirm password field's visibility via ResetPasswordForm's own state", async () => {
    const user = userEvent.setup();
    const { container } = render(<ResetPasswordForm />);

    const confirmInput = getInputByName(container, 'confirmPassword');
    expect(confirmInput).toHaveAttribute('type', 'password');

    await user.click(getOwnToggleButton(container, 'confirmPassword'));

    expect(confirmInput).toHaveAttribute('type', 'text');
  });
});
