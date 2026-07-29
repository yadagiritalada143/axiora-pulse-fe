import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouterDom from 'react-router-dom';
import { toast } from 'sonner';

import { VerifyOtpForm } from '@features/auth/components/VerifyOtpForm';
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
  } as UseVerifyOtpReturn);
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

function renderForm() {
  return render(<VerifyOtpForm heading="Enter the code" description="Check your inbox" />);
}

describe('VerifyOtpForm', () => {
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

    const { container } = renderForm();

    expect(mockedToastError).toHaveBeenCalledWith('Verification session expired.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the provided heading and description', () => {
    renderForm();

    expect(screen.getByText('Enter the code')).toBeInTheDocument();
    expect(screen.getByText('Check your inbox')).toBeInTheDocument();
  });

  it('keeps the verify button disabled until a 6-digit code is entered', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    const button = screen.getByRole('button', { name: /verify otp/i });
    expect(button).toBeDisabled();

    await user.type(getOtpInput(container), '12345');
    expect(button).toBeDisabled();
    expect(verifyOtpMutate).not.toHaveBeenCalled();
  });

  it('auto-submits with the correctly-shaped payload once 6 digits are entered', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(getOtpInput(container), '654321');

    await waitFor(() =>
      expect(verifyOtpMutate).toHaveBeenCalledWith({ id: 42, otp: 654321, flow: 'register' }),
    );
  });

  it('disables the verify button and shows a loader while pending', () => {
    mockUseVerifyOtpReturn({ isPending: true });
    renderForm();

    expect(screen.getByRole('button', { name: /verify otp/i })).toBeDisabled();
  });

  it('shows a resend button once the countdown elapses and resends the OTP on click', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderForm();

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
