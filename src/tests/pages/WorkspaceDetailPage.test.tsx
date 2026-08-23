import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import WorkspaceDetailPage from '@pages/WorkspaceDetailPage';

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspace: jest.fn(),
}));

jest.mock('@features/auth/hooks', () => ({
  useLogout: jest.fn(),
  useCurrentUser: jest.fn(() => ({ data: null, isLoading: false })),
}));

// WorkspaceMentorChat pulls in `react-markdown` (ESM-only) via `@components/chat`. This page's
// own composition logic (loading/error/success + MentorShell wiring) doesn't depend on how the
// chat UI renders internally, so stub the whole components barrel like WorkspacePage.test.tsx does.
jest.mock('@features/workspace/components', () => ({
  WorkspaceMentorChat: ({ workspaceId }: { workspaceId: number }) => (
    <div>Mentor chat for workspace {workspaceId}</div>
  ),
}));

const mockedUseWorkspace = useWorkspace as jest.Mock;

const workspace: Workspace = {
  id: 42,
  user_id: 1,
  name: 'Rocket Idea',
  description: 'desc',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function renderPage(workspaceId = '42') {
  return render(
    <MemoryRouter initialEntries={[`/workspace/${workspaceId}`]}>
      <Routes>
        <Route path="/workspace/:workspaceId" element={<WorkspaceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WorkspaceDetailPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching the workspace', () => {
    mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = renderPage();

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows a not-found message when the fetch errors', () => {
    mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderPage();

    expect(screen.getByText('Workspace not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to workspaces' })).toBeInTheDocument();
  });

  it('shows a not-found message when there is no workspace data even without an explicit error', () => {
    mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    renderPage();

    expect(screen.getByText('Workspace not found')).toBeInTheDocument();
  });

  it('renders the mentor chat with the fetched workspace id on success', () => {
    mockedUseWorkspace.mockReturnValue({ data: workspace, isLoading: false, isError: false });

    renderPage();

    expect(screen.getByText('Mentor chat for workspace 42')).toBeInTheDocument();
    expect(mockedUseWorkspace).toHaveBeenCalledWith(42);
  });

  it('passes the workspace name as the shell section label', () => {
    mockedUseWorkspace.mockReturnValue({ data: workspace, isLoading: false, isError: false });

    renderPage();

    expect(screen.getByText('Rocket Idea')).toBeInTheDocument();
  });

  it('falls back to the dashboard route for the AI Mentor nav link when there is no workspace id in the URL', () => {
    mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    // Render outside of a matching `/workspace/:workspaceId` route so `useParams` returns no
    // `workspaceId`, exercising the ternary's fallback-to-dashboard branch.
    render(
      <MemoryRouter initialEntries={['/workspace']}>
        <WorkspaceDetailPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ai mentor/i })).toHaveAttribute('href', '/dashboard');
  });
});
