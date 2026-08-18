import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ForgotPasswordForm } from '@features/auth/components/ForgotPasswordForm';
import { useForgotPassword, useVerifyForgotPassword, useResetPassword } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/auth/hooks', () => ({
  useForgotPassword: jest.fn(),
  useVerifyForgotPassword: jest.fn(),
  useResetPassword: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@store/auth.store');

// The OTP step renders input-otp's <OTPInput>, which observes its container size via
// ResizeObserver — a browser API jsdom doesn't implement.
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
global.ResizeObserver = MockResizeObserver;
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

const mockedUseForgotPassword = jest.mocked(useForgotPassword);
const mockedUseVerifyForgotPassword = jest.mocked(useVerifyForgotPassword);
const mockedUseResetPassword = jest.mocked(useResetPassword);
const mockedUseAuthStore = jest.mocked(useAuthStore);

type UseForgotPasswordReturn = ReturnType<typeof useForgotPassword>;
type UseVerifyForgotPasswordReturn = ReturnType<typeof useVerifyForgotPassword>;
type UseResetPasswordReturn = ReturnType<typeof useResetPassword>;
type MutateOptions = { onSuccess?: () => void } | undefined;

const forgotPasswordMutate = jest.fn<void, [{ emailOrMobile: string }, MutateOptions]>();
const verifyForgotPasswordMutate = jest.fn<
  void,
  [{ emailOrMobile: string; code: number }, MutateOptions]
>();
const resetPasswordMutate = jest.fn<
  void,
  [{ reset_token: string; new_password: string }, MutateOptions]
>();

function mockForgotPasswordReturn(overrides: Partial<UseForgotPasswordReturn> = {}) {
  mockedUseForgotPassword.mockReturnValue({
    mutate: forgotPasswordMutate,
    isPending: false,
    ...overrides,
  } as UseForgotPasswordReturn);
}

function mockVerifyForgotPasswordReturn(overrides: Partial<UseVerifyForgotPasswordReturn> = {}) {
  mockedUseVerifyForgotPassword.mockReturnValue({
    mutate: verifyForgotPasswordMutate,
    isPending: false,
    ...overrides,
  } as UseVerifyForgotPasswordReturn);
}

function mockResetPasswordReturn(overrides: Partial<UseResetPasswordReturn> = {}) {
  mockedUseResetPassword.mockReturnValue({
    mutate: resetPasswordMutate,
    isPending: false,
    ...overrides,
  } as UseResetPasswordReturn);
}

function mockAuthStore() {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      user: null,
      isAuthenticated: false,
      mfaData: null,
      resetEmailOrMobile: 'jane@example.com',
      resetToken: 'reset-token-abc',

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
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    }),
  );
}

function renderForm() {
  return render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>,
  );
}

function getOtpInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[data-input-otp]');
  if (!input) {
    throw new Error('OTP input not found');
  }
  return input;
}

function getInputByName(container: HTMLElement, name: string): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) {
    throw new Error(`Input with name "${name}" not found`);
  }
  return input;
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockForgotPasswordReturn();
    mockVerifyForgotPasswordReturn();
    mockResetPasswordReturn();
    mockAuthStore();

    forgotPasswordMutate.mockImplementation((_vars, opts) => opts?.onSuccess?.());
    verifyForgotPasswordMutate.mockImplementation((_vars, opts) => opts?.onSuccess?.());
    resetPasswordMutate.mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Guards against a fake-timer test failing before its own cleanup runs -
    // real timers must be restored or every later test using userEvent hangs.
    jest.useRealTimers();
  });

  it('shows a validation error when the email/mobile field is submitted empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(forgotPasswordMutate).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email/mobile format', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email'), 'not-valid');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(forgotPasswordMutate).not.toHaveBeenCalled();
  });

  it('disables the "Send Reset Code" button and shows a loader while pending', () => {
    mockForgotPasswordReturn({ isPending: true });
    renderForm();

    const button = screen.getByRole('button', { name: /send reset code/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('walks through all three steps to a successful password reset', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    // Step 1: request the reset code.
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(forgotPasswordMutate).toHaveBeenCalledWith(
      { emailOrMobile: 'jane@example.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    // Step 2: verify the OTP code.
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    await user.type(getOtpInput(container), '123456');

    await waitFor(() =>
      expect(verifyForgotPasswordMutate).toHaveBeenCalledWith(
        { emailOrMobile: 'jane@example.com', code: 123456 },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      ),
    );

    // Step 3: set the new password.
    expect(await screen.findByText('Create new password')).toBeInTheDocument();

    await user.type(getInputByName(container, 'new_password'), 'newSecret123');
    await user.type(getInputByName(container, 'confirmPassword'), 'newSecret123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() =>
      expect(resetPasswordMutate).toHaveBeenCalledWith({
        reset_token: 'reset-token-abc',
        new_password: 'newSecret123',
      }),
    );
  });

  it('keeps the "Verify Code" button disabled until a 6-digit code is entered', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify code/i })).toBeDisabled();

    await user.type(getOtpInput(container), '123');
    expect(screen.getByRole('button', { name: /verify code/i })).toBeDisabled();
    expect(verifyForgotPasswordMutate).not.toHaveBeenCalled();
  });

  it('shows a validation error when the new passwords do not match', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await user.type(getOtpInput(container), '123456');

    expect(await screen.findByText('Create new password')).toBeInTheDocument();

    await user.type(getInputByName(container, 'new_password'), 'newSecret123');
    await user.type(getInputByName(container, 'confirmPassword'), 'somethingElse1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(resetPasswordMutate).not.toHaveBeenCalled();
  });

  it('resends the code once the countdown reaches zero and resets it', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    expect(await screen.findByText(/00:60/)).toBeInTheDocument();

    // The countdown effect re-subscribes its interval every tick (depends on `seconds`), so
    // it must be advanced one second at a time, settling after each, until zero is reached.
    for (let i = 0; i < 120 && !screen.queryByRole('button', { name: /resend code/i }); i += 1) {
      await jest.advanceTimersByTimeAsync(1000);
    }

    const resendButton = screen.getByRole('button', { name: /resend code/i });
    await user.click(resendButton);

    expect(forgotPasswordMutate).toHaveBeenCalledWith(
      { emailOrMobile: 'jane@example.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(await screen.findByText('00:60')).toBeInTheDocument();
  }, 20_000);

  it('treats a missing session on verify as expired and returns to step 1', async () => {
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        mfaData: null,
        resetEmailOrMobile: null,
        resetToken: null,

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
        setHasCompletedQuestionnaire: jest.fn(),
        setShowQuestionnaireIntro: jest.fn(),
      }),
    );

    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');

    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();

    await user.type(getOtpInput(container), '123456');

    expect(await screen.findByText('Forgot password?')).toBeInTheDocument();
    expect(verifyForgotPasswordMutate).not.toHaveBeenCalled();
  });
  it('retries verification via the Verify Code button after a failed attempt', async () => {
    verifyForgotPasswordMutate.mockImplementation(() => undefined); // no onSuccess: simulates a pending failure
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument();

    await user.type(getOtpInput(container), '123456');
    expect(verifyForgotPasswordMutate).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /verify code/i }));
    expect(verifyForgotPasswordMutate).toHaveBeenCalledTimes(2);
  });

  it('rejects a new-password submission when the reset session is missing', async () => {
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        mfaData: null,
        resetEmailOrMobile: 'jane@example.com',
        resetToken: null,

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
        setHasCompletedQuestionnaire: jest.fn(),
        setShowQuestionnaireIntro: jest.fn(),
      }),
    );
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await user.type(getOtpInput(container), '123456');
    expect(await screen.findByText('Create new password')).toBeInTheDocument();

    await user.type(getInputByName(container, 'new_password'), 'newSecret123');
    await user.type(getInputByName(container, 'confirmPassword'), 'newSecret123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => expect(resetPasswordMutate).not.toHaveBeenCalled());
  });

  it('toggles the visibility of both new-password fields', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await user.type(getOtpInput(container), '123456');
    expect(await screen.findByText('Create new password')).toBeInTheDocument();

    const newPasswordInput = getInputByName(container, 'new_password');
    const confirmInput = getInputByName(container, 'confirmPassword');
    const [firstToggle, secondToggle] = container.querySelectorAll('button[tabindex="-1"]');
    if (!firstToggle || !secondToggle) {
      throw new Error('Expected two password visibility toggles');
    }

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    await user.click(firstToggle);
    expect(newPasswordInput).toHaveAttribute('type', 'text');

    expect(confirmInput).toHaveAttribute('type', 'password');
    await user.click(secondToggle);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });
});
