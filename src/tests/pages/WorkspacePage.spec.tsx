import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDeleteWorkspace, useWorkspaces } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import WorkspacePage from '@pages/WorkspacePage';

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspaces: jest.fn(),
  useDeleteWorkspace: jest.fn(),
}));

jest.mock('@features/workspace/components', () => ({
  CreateWorkspaceDialog: ({ open }: { open: boolean }) => (
    <div data-testid="create-dialog">{open ? 'create-open' : 'create-closed'}</div>
  ),
  WorkspaceEmpty: ({ onCreate }: { onCreate: () => void }) => (
    <button onClick={onCreate}>empty-create</button>
  ),
  WorkspaceGrid: ({
    workspaces,
    onWorkspaceClick,
    onWorkspaceDelete,
  }: {
    workspaces: Workspace[];
    onWorkspaceClick: (id: number) => void;
    onWorkspaceDelete: (workspace: Workspace) => void;
  }) => (
    <div data-testid="grid">
      {workspaces.map((workspace) => (
        <div key={workspace.id}>
          <span>{workspace.name}</span>
          <button onClick={() => onWorkspaceClick(workspace.id)}>open-{workspace.id}</button>
          <button onClick={() => onWorkspaceDelete(workspace)}>delete-{workspace.id}</button>
        </div>
      ))}
    </div>
  ),
  DeleteWorkspaceDialog: ({
    open,
    loading,
    workspaceName,
    onConfirm,
    onOpenChange,
  }: {
    open: boolean;
    loading: boolean;
    workspaceName?: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="delete-dialog">
      <span>{open ? 'delete-open' : 'delete-closed'}</span>
      <span>{workspaceName ?? 'no-name'}</span>
      <span>{loading ? 'loading' : 'idle'}</span>
      <button onClick={onConfirm}>confirm-delete</button>
      <button onClick={() => onOpenChange(false)}>close-delete</button>
      <button onClick={() => onOpenChange(true)}>reopen-delete</button>
    </div>
  ),
}));

const mockedUseWorkspaces = useWorkspaces as jest.Mock;
const mockedUseDeleteWorkspace = useDeleteWorkspace as jest.Mock;

const workspace: Workspace = {
  id: 1,
  user_id: 1,
  name: 'Alpha',
  description: 'a',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

let deleteMutate: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  deleteMutate = jest.fn((_id: number, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
  );
  mockedUseDeleteWorkspace.mockReturnValue({ mutate: deleteMutate, isPending: false });
});

describe('WorkspacePage', () => {
  it('renders a spinner while loading', () => {
    mockedUseWorkspaces.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = render(<WorkspacePage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders an error state', () => {
    mockedUseWorkspaces.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<WorkspacePage />);

    expect(screen.getByText('Failed to load workspaces. Please try again.')).toBeInTheDocument();
  });

  it('shows the empty state when data is undefined', () => {
    mockedUseWorkspaces.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(<WorkspacePage />);

    expect(screen.getByText('empty-create')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new workspace/i })).not.toBeInTheDocument();
  });

  it('opens the create dialog from the empty state', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 0, workspaces: [] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    expect(screen.getByTestId('create-dialog')).toHaveTextContent('create-closed');
    await userEvent.click(screen.getByText('empty-create'));
    expect(screen.getByTestId('create-dialog')).toHaveTextContent('create-open');
  });

  it('renders the grid and opens the create dialog from the header button', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /new workspace/i }));
    expect(screen.getByTestId('create-dialog')).toHaveTextContent('create-open');
  });

  it('does nothing when confirming a delete with no selected workspace', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    await userEvent.click(screen.getByText('confirm-delete'));

    expect(deleteMutate).not.toHaveBeenCalled();
  });

  it('opens the delete dialog and deletes the selected workspace', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    await userEvent.click(screen.getByText('delete-1'));
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent('delete-open');
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent('Alpha');

    await userEvent.click(screen.getByText('confirm-delete'));

    const onSuccessMatcher: unknown = expect.any(Function);
    expect(deleteMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onSuccess: onSuccessMatcher }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('delete-dialog')).toHaveTextContent('delete-closed'),
    );
  });

  it('closes the delete dialog via onOpenChange(false) and ignores onOpenChange(true)', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    await userEvent.click(screen.getByText('delete-1'));
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent('delete-open');

    // onOpenChange(true) is a no-op branch — dialog stays open.
    await userEvent.click(screen.getByText('reopen-delete'));
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent('delete-open');

    // onOpenChange(false) clears the target and closes.
    await userEvent.click(screen.getByText('close-delete'));
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent('delete-closed');
  });

  it('forwards a card click through the grid without error', async () => {
    mockedUseWorkspaces.mockReturnValue({
      data: { total: 1, workspaces: [workspace] },
      isLoading: false,
      isError: false,
    });

    render(<WorkspacePage />);

    await userEvent.click(screen.getByText('open-1'));

    // The page passes a no-op click handler; nothing should throw.
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});
