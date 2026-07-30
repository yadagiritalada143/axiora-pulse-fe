import { render, screen } from '@testing-library/react';

import OnboardingPage from '@pages/OnboardingPage';

// OnboardingFlow has its own dedicated tests elsewhere; this page is a thin wrapper,
// so it's stubbed here to verify composition only.
jest.mock('@features/onboarding/components', () => ({
  OnboardingFlow: () => <div data-testid="onboarding-flow" />,
}));

describe('OnboardingPage', () => {
  it('renders the onboarding flow', () => {
    render(<OnboardingPage />);

    expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
  });
});
