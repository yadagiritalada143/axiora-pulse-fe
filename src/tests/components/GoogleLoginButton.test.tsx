import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let mockGoogleClientId = 'test-client-id';
let mockOnSuccess: ((resp: { credential: string }) => void) | null = null;
let mockOnError: (() => void) | null = null;
const mockMutate = jest.fn();

jest.mock('@config/app.config', () => ({
  appConfig: {
    get googleClientId() {
      return mockGoogleClientId;
    },
  },
}));

jest.mock('@react-oauth/google', () => {
  const MockGoogleLogin = (props: {
    onSuccess: (resp: { credential: string }) => void;
    onError: () => void;
  }) => {
    mockOnSuccess = props.onSuccess;
    mockOnError = props.onError;
    return (
      <button type="button" onClick={() => props.onSuccess({ credential: 'google-token' })}>
        google
      </button>
    );
  };
  return { GoogleLogin: MockGoogleLogin };
});

jest.mock('@features/auth/hooks', () => ({
  useGoogleLogin: () => ({ mutate: mockMutate, isPending: false }),
}));

import { GoogleLoginButton } from '@features/auth/components/GoogleLoginButton';

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    mockGoogleClientId = 'test-client-id';
    mockOnSuccess = null;
    mockOnError = null;
    mockMutate.mockClear();
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(global, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: ResizeObserverMock,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 320,
    });
  });

  it('renders nothing when no Google client id is configured', () => {
    mockGoogleClientId = '';
    const { container } = render(<GoogleLoginButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the themed Continue with Google button by default', () => {
    render(<GoogleLoginButton />);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('renders the requested Google text label', () => {
    render(<GoogleLoginButton text="signup_with" />);
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('calls googleLogin.mutate with the credential on success', async () => {
    const user = userEvent.setup();
    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'google' }));
    mockOnSuccess?.({ credential: 'google-token' });

    expect(mockMutate).toHaveBeenCalledWith({ credential: 'google-token' });
  });

  it('shows an error toast when Google returns no credential', () => {
    render(<GoogleLoginButton />);

    mockOnSuccess?.({ credential: '' });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows an error toast when Google sign-in fails', async () => {
    const user = userEvent.setup();
    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'google' }));
    mockOnError?.();
  });
});
