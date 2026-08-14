import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import {
  useArchivedWorkspaces,
  usePermanentDeleteWorkspace,
  useRestoreWorkspace,
} from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import WorkspaceArchivePage from '@pages/WorkspaceArchivePage';

// `react-markdown`/`remark-gfm` are ESM-only and aren't transformable under the shared Jest
// config. They're only reachable because `@features/workspace/components` is a barrel that also
// re-exports `WorkspaceMentorChat` (which renders markdown) - stub them out so requiring the
// barrel doesn't blow up, matching the pattern used by WorkspacePage's test.
jest.mock('remark-gfm', () => () => null);
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <p>{children}</p>;
  };
});

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useArchivedWorkspaces: jest.fn(),
  useRestoreWorkspace: jest.fn(),
  usePermanentDeleteWorkspace: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUseArchivedWorkspaces = useArchivedWorkspaces as jest.Mock;
const mockedUseRestoreWorkspace = useRestoreWorkspace as jest.Mock;
const mockedUsePermanentDeleteWorkspace = usePermanentDeleteWorkspace as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const workspace: Workspace = {
  id: 3,
  user_id: 1,
  name: 'Archived Idea',
  description: 'An idea that was shelved',
  is_delete: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

/** Resolves a `mutate(id, { onSuccess })` call down the success path. */
function succeedingMutate() {
  return jest.fn((_id: number, options?: { onSuccess?: () => void }) => options?.onSuccess?.());
}

/** Resolves a `mutate(id, { onError })` call down the failure path. */
function failingMutate() {
  return jest.fn((_id: number, options?: { onError?: () => void }) => options?.onError?.());
}

function withWorkspaces(workspaces: Workspace[]) {
  mockedUseArchivedWorkspaces.mockReturnValue({
    data: { total: workspaces.length, workspaces },
    isLoading: false,
    isError: false,
  });
}

async function openDeleteConfirmation(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
  await user.click(await screen.findByText('Delete Permanently'));
}

describe('WorkspaceArchivePage', () => {
  beforeEach(() => {
    mockedUseRestoreWorkspace.mockReturnValue({ mutate: jest.fn() });
    mockedUsePermanentDeleteWorkspace.mockReturnValue({ mutate: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching archived workspaces', () => {
    mockedUseArchivedWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { container } = render(<WorkspaceArchivePage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    mockedUseArchivedWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<WorkspaceArchivePage />);

    expect(
      screen.getByText('Failed to load archived workspaces. Please try again.'),
    ).toBeInTheDocument();
  });

  it('shows the empty state when nothing has been archived', () => {
    mockedUseArchivedWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<WorkspaceArchivePage />);

    expect(screen.getByText('No archived workspaces')).toBeInTheDocument();
  });

  it('renders a card per archived workspace', () => {
    withWorkspaces([workspace]);

    render(<WorkspaceArchivePage />);

    expect(screen.getByText('Archived Idea')).toBeInTheDocument();
    expect(screen.queryByText('No archived workspaces')).not.toBeInTheDocument();
  });

  it('restores a workspace and toasts on success', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    const mutate = succeedingMutate();
    mockedUseRestoreWorkspace.mockReturnValue({ mutate });

    render(<WorkspaceArchivePage />);

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Restore'));

    expect(mutate).toHaveBeenCalledWith(3, expect.any(Object));
    expect(mockedToast.success).toHaveBeenCalledWith('Workspace restored successfully.');
  });

  it('toasts an error when restoring fails', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    mockedUseRestoreWorkspace.mockReturnValue({ mutate: failingMutate() });

    render(<WorkspaceArchivePage />);

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Restore'));

    expect(mockedToast.error).toHaveBeenCalledWith(
      'Failed to restore workspace. Please try again.',
    );
  });

  it('asks for confirmation before permanently deleting', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    const mutate = jest.fn();
    mockedUsePermanentDeleteWorkspace.mockReturnValue({ mutate });

    render(<WorkspaceArchivePage />);
    await openDeleteConfirmation(user);

    expect(screen.getByText('Delete Workspace Permanently')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('closes the confirmation dialog on Cancel without deleting', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    const mutate = jest.fn();
    mockedUsePermanentDeleteWorkspace.mockReturnValue({ mutate });

    render(<WorkspaceArchivePage />);
    await openDeleteConfirmation(user);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete Workspace Permanently')).not.toBeInTheDocument();
  });

  it('permanently deletes the workspace and closes the dialog on success', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    const mutate = succeedingMutate();
    mockedUsePermanentDeleteWorkspace.mockReturnValue({ mutate });

    render(<WorkspaceArchivePage />);
    await openDeleteConfirmation(user);
    await user.click(screen.getByRole('button', { name: 'Delete Permanently' }));

    expect(mutate).toHaveBeenCalledWith(3, expect.any(Object));
    expect(mockedToast.success).toHaveBeenCalledWith('Workspace deleted permanently.');
    expect(screen.queryByText('Delete Workspace Permanently')).not.toBeInTheDocument();
  });

  it('toasts an error and keeps the dialog open when the delete fails', async () => {
    const user = userEvent.setup();
    withWorkspaces([workspace]);
    mockedUsePermanentDeleteWorkspace.mockReturnValue({ mutate: failingMutate() });

    render(<WorkspaceArchivePage />);
    await openDeleteConfirmation(user);
    await user.click(screen.getByRole('button', { name: 'Delete Permanently' }));

    expect(mockedToast.error).toHaveBeenCalledWith(
      'Failed to permanently delete workspace. Please try again.',
    );
    expect(screen.getByText('Delete Workspace Permanently')).toBeInTheDocument();
  });
});
