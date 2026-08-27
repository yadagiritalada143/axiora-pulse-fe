import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { VerifyLoginForm } from '@features/auth/components/VerifyLoginForm';
import { useResendOtp } from '@features/auth/hooks/useResendOtp';
import { useVerifyOtp } from '@features/auth/hooks/useVerifyOtp';
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

jest.mock('@features/auth/hooks/useVerifyOtp', () => ({
  useVerifyOtp: jest.fn(),
}));

jest.mock('@features/auth/hooks/useResendOtp', () => ({
  useResendOtp: jest.fn(),
}));

jest.mock('@store/auth.store');

class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
global.ResizeObserver = MockResizeObserver;
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

const mockedUseVerifyOtp = jest.mocked(useVerifyOtp);
const mockedUseResendOtp = jest.mocked(useResendOtp);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedToastError = jest.mocked(toast.error);

type UseVerifyOtpReturn = ReturnType<typeof useVerifyOtp>;
type UseResendOtpReturn = ReturnType<typeof useResendOtp>;

const verifyOtpMutate = jest.fn();
const resendOtpMutate = jest.fn();

function mockUseVerifyOtpReturn(overrides: Partial<UseVerifyOtpReturn> = {}) {
  mockedUseVerifyOtp.mockReturnValue({
    mutate: verifyOtpMutate,
    isPending: false,
    ...overrides,
  } as unknown as UseVerifyOtpReturn);
}

function mockUseResendOtpReturn(overrides: Partial<UseResendOtpReturn> = {}) {
  mockedUseResendOtp.mockReturnValue({
    mutate: resendOtpMutate,
    isPending: false,
    ...overrides,
  } as unknown as UseResendOtpReturn);
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
    mockUseVerifyOtpReturn();
    mockUseResendOtpReturn();
    mockMfaData({
      userid: 42,
      username: 'jane@example.com',
      identifier: 'jane@example.com',
      mfaVerified: false,
      flow: 'register',
    });
  });

  it('redirects to login with an error toast when there is no active MFA session', () => {
    mockMfaData(null);

    const { container } = render(<VerifyLoginForm />);

    expect(mockedToastError).toHaveBeenCalledWith('Verification session expired.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the registration heading and identifier when registering', () => {
    render(<VerifyLoginForm />);

    expect(screen.getByText('Verify Your Account')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('keeps the verify button disabled until a 6-digit OTP is entered', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    const button = screen.getByRole('button', { name: /verify & continue/i });
    expect(button).toBeDisabled();

    await user.type(getOtpInput(container), '999');
    expect(button).toBeDisabled();
    expect(verifyOtpMutate).not.toHaveBeenCalled();
  });

  it('enables the Verify button without automatically submitting when 6 digits are entered', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    const button = screen.getByRole('button', { name: /verify & continue/i });
    expect(button).toBeDisabled();

    await user.type(getOtpInput(container), '111222');

    expect(button).toBeEnabled();
    expect(verifyOtpMutate).not.toHaveBeenCalled();
  });

  it('submits via the Verify button when clicked after entering 6 digits', async () => {
    const user = userEvent.setup();
    const { container } = render(<VerifyLoginForm />);

    await user.type(getOtpInput(container), '111222');
    expect(verifyOtpMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /verify & continue/i }));

    expect(verifyOtpMutate).toHaveBeenCalledWith({
      id: 42,
      emailOrMobile: 'jane@example.com',
      otp: 111222,
      flow: 'register',
    });
  });

  it('disables the verify button and shows a loader while pending', () => {
    mockUseVerifyOtpReturn({ isPending: true });
    render(<VerifyLoginForm />);

    expect(screen.getByRole('button', { name: /verify & continue/i })).toBeDisabled();
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
