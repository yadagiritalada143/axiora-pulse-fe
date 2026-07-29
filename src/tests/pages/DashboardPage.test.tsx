import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useInteractiveQuestions } from '@/features/onboarding/hooks';
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useWorkspaces,
} from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import DashboardPage from '@pages/DashboardPage';
import { useAuthStore } from '@store/auth.store';

// `react-markdown`/`remark-gfm` are ESM-only and aren't transformable under the shared Jest
// config (out of scope here). They're only reachable because `@features/workspace/components`
// is a barrel that also re-exports `WorkspaceMentorChat` (which renders markdown) - stub them
// out so requiring the barrel doesn't blow up, matching the pattern used by chat component tests.
jest.mock('remark-gfm', () => () => null);
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <p>{children}</p>;
  };
});

jest.mock('@features/onboarding/components', () => ({
  InteractiveQuestionsFlow: () => null,
}));

jest.mock('@features/ideaValidation/components', () => ({
  MentorShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mentor-shell">{children}</div>
  ),
}));

jest.mock('@features/onboarding/hooks', () => ({
  useInteractiveQuestions: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspaces: jest.fn(),
  useDeleteWorkspace: jest.fn(),
  useCreateWorkspace: jest.fn(),
}));

const mockedUseWorkspaces = useWorkspaces as jest.Mock;
const mockedUseDeleteWorkspace = useDeleteWorkspace as jest.Mock;
const mockedUseCreateWorkspace = useCreateWorkspace as jest.Mock;
const mockedUseInteractiveQuestions = useInteractiveQuestions as jest.Mock;

const workspace: Workspace = {
  id: 1,
  user_id: 1,
  name: 'Rocket Idea',
  description: 'desc',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

function setAuthState(overrides: Partial<ReturnType<typeof useAuthStore.getState>> = {}) {
  useAuthStore.setState({
    hasActivePlan: true,
    user: null,
    showQuestionnaireIntro: false,
    hasCompletedQuestionnaire: false,
    ...overrides,
  });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedUseDeleteWorkspace.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockedUseCreateWorkspace.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    mockedUseInteractiveQuestions.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    useAuthStore.setState({
      hasActivePlan: false,
      user: null,
      showQuestionnaireIntro: false,
      hasCompletedQuestionnaire: false,
    });
  });

  it('renders the workspace list inside the mentor shell', () => {
    setAuthState();

    renderDashboard();

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workspaces' })).toBeInTheDocument();
    expect(screen.getByText('Rocket Idea')).toBeInTheDocument();
  });

  it('renders the dashboard when the questionnaire intro is showing', () => {
    setAuthState({
      showQuestionnaireIntro: true,
    });

    renderDashboard();

    expect(screen.getByTestId('mentor-shell')).toBeInTheDocument();
  });
});
