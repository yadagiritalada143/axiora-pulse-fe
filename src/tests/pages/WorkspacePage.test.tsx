import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useWorkspaces,
} from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import WorkspacePage from '@pages/WorkspacePage';

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

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspaces: jest.fn(),
  useDeleteWorkspace: jest.fn(),
  useCreateWorkspace: jest.fn(),
}));

const mockedUseWorkspaces = useWorkspaces as jest.Mock;
const mockedUseDeleteWorkspace = useDeleteWorkspace as jest.Mock;
const mockedUseCreateWorkspace = useCreateWorkspace as jest.Mock;

const workspace: Workspace = {
  id: 1,
  user_id: 1,
  name: 'Rocket Idea',
  description: 'desc',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkspacePage />
    </MemoryRouter>,
  );
}

describe('WorkspacePage', () => {
  beforeEach(() => {
    mockedUseDeleteWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching workspaces', () => {
    mockedUseWorkspaces.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = renderPage();

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('No Workspaces Yet')).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    mockedUseWorkspaces.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderPage();

    expect(screen.getByText('Failed to load workspaces. Please try again.')).toBeInTheDocument();
  });

  it('shows the empty state when there are no workspaces', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 0, workspaces: [] },
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('No Workspaces Yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new workspace/i })).not.toBeInTheDocument();
  });

  it('renders the workspace grid when workspaces exist', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('Rocket Idea')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new workspace/i })).toBeInTheDocument();
  });

  it('opens the create dialog from the empty state CTA', async () => {
    const user = userEvent.setup();
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 0, workspaces: [] },
      isLoading: false,
      isError: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: /create workspace/i }));

    expect(screen.getByRole('heading', { name: 'Create Workspace' })).toBeInTheDocument();
  });

  it('opens the delete dialog when deleting a workspace from the grid', async () => {
    const user = userEvent.setup();
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Delete'));

    expect(screen.getByText('Archive Workspace')).toBeInTheDocument();
  });

  it('opens the create dialog from the "New Workspace" button', async () => {
    const user = userEvent.setup();
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: /new workspace/i }));

    expect(screen.getByRole('heading', { name: 'Create Workspace' })).toBeInTheDocument();
  });

  it('confirms deletion by calling mutate with the target id and closes the dialog on success', async () => {
    const user = userEvent.setup();
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });
    const mutate = jest.fn((_id: number, options?: { onSuccess?: () => void }) =>
      options?.onSuccess?.(),
    );
    mockedUseDeleteWorkspace.mockReturnValue({ mutate, isPending: false });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Delete'));
    await user.click(screen.getByRole('button', { name: 'Move to Archive' }));

    expect(mutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onSuccess: expect.any(Function) as unknown }),
    );
    expect(screen.queryByText('Archive Workspace')).not.toBeInTheDocument();
  });

  it('closes the delete dialog without confirming when Cancel is clicked', async () => {
    const user = userEvent.setup();
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });
    const mutate = jest.fn();
    mockedUseDeleteWorkspace.mockReturnValue({ mutate, isPending: false });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Delete'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByText('Archive Workspace')).not.toBeInTheDocument();
  });
});
