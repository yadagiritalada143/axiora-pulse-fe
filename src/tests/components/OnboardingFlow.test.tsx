import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTES } from '@constants/routes';
import { OnboardingFlow } from '@features/onboarding/components/OnboardingFlow';

const mockNavigate = jest.fn();
const mockSetOnboardingPending = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

interface MockAuthState {
  setOnboardingPending: typeof mockSetOnboardingPending;
}

jest.mock('@store/auth.store', () => ({
  useAuthStore: (selector: (state: MockAuthState) => unknown) =>
    selector({ setOnboardingPending: mockSetOnboardingPending }),
}));

describe('OnboardingFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts on the welcome step', () => {
    render(<OnboardingFlow />);

    expect(screen.getByRole('heading', { name: 'Welcome to Axiora Pulse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('advances to the guide step after clicking Continue', async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('button', { name: /choose plan/i })).toBeInTheDocument();
  });

  it('clears onboardingPending and navigates to pricing when a plan is chosen', async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /choose plan/i }));

    expect(mockSetOnboardingPending).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRICING);
  });
});
