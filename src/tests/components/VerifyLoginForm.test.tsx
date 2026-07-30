import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { VerifyLoginForm } from '@features/auth/components/VerifyLoginForm';
import { useResendOtp } from '@features/auth/hooks/useResendOtp';
import { useVerifyLogin } from '@features/auth/hooks/useVerifyLogin';
import type { MFAData } from '@store/auth.store';
import { useAuthStore } from '@store/auth.store';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@features/auth/hooks/useVerifyLogin', () => ({
  useVerifyLogin: jest.fn(),
}));

jest.mock('@features/auth/hooks/useResendOtp', () => ({
  useResendOtp: jest.fn(),
}));

jest.mock('@store/auth.store');

// The OTP input renders input-otp's <OTPInput>, which observes its container size via
// ResizeObserver and probes password-manager badges via document.elementFromPoint —
// neither of which jsdom implements.
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
global.ResizeObserver = MockResizeObserver;
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

const mockedUseVerifyLogin = jest.mocked(useVerifyLogin);
const mockedUseResendOtp = jest.mocked(useResendOtp);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastError = jest.mocked(toast.error);

type UseVerifyLoginReturn = ReturnType<typeof useVerifyLogin>;
type UseResendOtpReturn = ReturnType<typeof useResendOtp>;

const verifyLoginMutate = jest.fn();
const resendOtpMutate = jest.fn();

function mockUseVerifyLoginReturn(overrides: Partial<UseVerifyLoginReturn> = {}) {
  mockedUseVerifyLogin.mockReturnValue({
    mutate: verifyLoginMutate,
    isPending: false,
    ...overrides,
  } as UseVerifyLoginReturn);
}

function mockUseResendOtpReturn(overrides: Partial<UseResendOtpReturn> = {}) {
  mockedUseResendOtp.mockReturnValue({
    mutate: resendOtpMutate,
    isPending: false,
    ...overrides,
  } as UseResendOtpReturn);
}

function mockMfaData(mfaData: MFAData | null) {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      user: null,
      isAuthenticated: false,

      mfaData,

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

      // New actions (if present in your store)
      setHasCompletedQuestionnaire: jest.fn(),
      setShowQuestionnaireIntro: jest.fn(),
    }),
  );
}

function getOtpInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[data-input-otp]');
  if (!input) {
    throw new Error('OTP input not found');
  }
  return input;
}

describe('VerifyLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVerifyLoginReturn();
    mockUseResendOtpReturn();
    mockMfaData({
      userid: 0,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'login',
    });
  });

  it('redirects to login with an error toast when there is no active login MFA session', () => {
    mockMfaData(null);

    const { container } = render(<VerifyLoginForm />);

    expect(mockedToastError).toHaveBeenCalledWith('Login verification session expired.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to login when the MFA session belongs to the register flow, not login', () => {
    mockMfaData({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'register',
    });

    render(<VerifyLoginForm />);

    expect(mockedToastError).toHaveBeenCalledWith('Login verification session expired.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders the identifier the OTP was sent to', () => {
    render(<VerifyLoginForm />);

    expect(screen.getByText('Verify Login OTP')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('keeps the verify button disabled until a 6-digit OTP is entered', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    const button = screen.getByRole('button', { name: /verify login/i });
    expect(button).toBeDisabled();

    await user.type(getOtpInput(container), '999');
    expect(button).toBeDisabled();
    expect(verifyLoginMutate).not.toHaveBeenCalled();
  });

  it('auto-submits with the correctly-shaped payload once 6 digits are entered', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    await user.type(getOtpInput(container), '111222');

    await waitFor(() =>
      expect(verifyLoginMutate).toHaveBeenCalledWith({
        emailOrMobile: 'jane@example.com',
        otp: 111222,
      }),
    );
  });

  it('also submits via the Verify Login button once it is enabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    await user.type(getOtpInput(container), '111222');
    verifyLoginMutate.mockClear();

    // handleVerify's own isPending/length guards mirror the disabled-button state exactly
    // (the button is only ever enabled once otp.length === 6 and isPending is false), so this
    // exercises handleVerify's call-through path via a direct click rather than only the
    // OtpInput's auto-submit-on-change path covered above.
    await user.click(screen.getByRole('button', { name: /verify login/i }));

    expect(verifyLoginMutate).toHaveBeenCalledWith({
      emailOrMobile: 'jane@example.com',
      otp: 111222,
    });
  });

  it('disables the verify button and shows a loader while pending', () => {
    mockUseVerifyLoginReturn({ isPending: true });
    render(<VerifyLoginForm />);

    expect(screen.getByRole('button', { name: /verify login/i })).toBeDisabled();
  });

  it('shows a resend button once the countdown elapses and resends the OTP on click', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<VerifyLoginForm />);

    expect(screen.getByText(/resend otp in/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    const resendButton = await screen.findByRole('button', { name: /resend otp/i });
    await user.click(resendButton);

    expect(resendOtpMutate).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
