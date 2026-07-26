import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import DashboardPage from '@pages/DashboardPage';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/onboarding/components', () => ({
  OnboardingFlow: () => null,
  InteractiveQuestionsFlow: () => null,
}));
jest.mock('@features/onboarding/hooks', () => ({
  useInteractiveQuestions: () => ({ data: [] }),
}));

jest.mock('@features/ideaValidation/components', () => ({
  IdeaInputForm: ({ onValidated }: { onValidated: (response: unknown, title: string) => void }) => (
    <div>
      <span>Idea input form</span>
      <button type="button" onClick={() => onValidated({ run_id: 'run-1' }, 'My idea')}>
        Fake submit
      </button>
    </div>
  ),
  IdeaValidationReport: ({
    ideaTitle,
    onRetake,
  }: {
    ideaTitle: string;
    response: OrchestrationRunResponse;
    onRetake: () => void;
  }) => (
    <div>
      <span>Validation report for {ideaTitle}</span>
      <button type="button" onClick={onRetake}>
        Fake retake
      </button>
    </div>
  ),
}));

function setAuthState(overrides: { onboardingPending?: boolean; hasActivePlan?: boolean } = {}) {
  useAuthStore.setState({
    onboardingPending: overrides.onboardingPending ?? false,
    hasActivePlan: overrides.hasActivePlan ?? true,
  });
}

describe('DashboardPage', () => {
  afterEach(() => {
    useAuthStore.setState({ onboardingPending: false, hasActivePlan: false });
  });

  it('renders the idea input form when no validation has been submitted yet', () => {
    setAuthState();

    render(<DashboardPage />);

    expect(screen.getByText('Idea input form')).toBeInTheDocument();
    expect(screen.queryByText(/Validation report for/)).not.toBeInTheDocument();
  });

  it('switches to the validation report once the idea form reports a successful run', async () => {
    setAuthState();
    const user = userEvent.setup();

    render(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: 'Fake submit' }));

    expect(screen.getByText('Validation report for My idea')).toBeInTheDocument();
    expect(screen.queryByText('Idea input form')).not.toBeInTheDocument();
  });

  it('returns to the idea input form when the report requests a retake', async () => {
    setAuthState();
    const user = userEvent.setup();

    render(<DashboardPage />);
    await user.click(screen.getByRole('button', { name: 'Fake submit' }));
    expect(screen.getByText('Validation report for My idea')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fake retake' }));

    expect(screen.getByText('Idea input form')).toBeInTheDocument();
    expect(screen.queryByText(/Validation report for/)).not.toBeInTheDocument();
  });
});
