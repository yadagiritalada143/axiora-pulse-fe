import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from '@pages/DashboardPage';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/onboarding/components', () => ({
  OnboardingFlow: () => null,
}));

jest.mock('@features/ideaValidation/components', () => ({
  MentorShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mentor-shell">{children}</div>
  ),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

function setAuthState(overrides: Partial<ReturnType<typeof useAuthStore.getState>> = {}) {
  useAuthStore.setState({
    onboardingPending: false,
    hasActivePlan: true,
    user: null,
    ...overrides,
  });
}

describe('DashboardPage', () => {
  afterEach(() => {
    useAuthStore.setState({
      onboardingPending: false,
      hasActivePlan: false,
      user: null,
    });
  });

  it('renders the dashboard content', () => {
    setAuthState();

    renderDashboard();

    expect(
      screen.getByRole('heading', {
        name: /welcome back/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /go to workspaces/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/start with a workspace/i)).toBeInTheDocument();

    expect(screen.getByText('Workspaces', { exact: true })).toBeInTheDocument();

    expect(screen.getByText('AI Mentor', { exact: true })).toBeInTheDocument();

    expect(screen.getByText('AI Chat', { exact: true })).toBeInTheDocument();

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
  });

  it('greets the user by name when user exists', () => {
    setAuthState({
      user: {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John',
        avatarUrl: '',
        role: undefined as never,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    renderDashboard();

    expect(
      screen.getByRole('heading', {
        name: /welcome back, john\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the dashboard when onboarding is pending', () => {
    setAuthState({
      onboardingPending: true,
    });

    renderDashboard();

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
  });
});
