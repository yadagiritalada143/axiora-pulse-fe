import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceGrid } from '@features/workspace/components/WorkspaceGrid';
import type { Workspace } from '@features/workspace/types';

jest.mock('@features/workspace/components/WorkspaceCard', () => ({
  WorkspaceCard: ({
    workspace,
    onClick,
    onDelete,
  }: {
    workspace: Workspace;
    onClick: (id: number) => void;
    onDelete: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onClick(workspace.id)}>
        {workspace.name}
      </button>
      <button type="button" onClick={onDelete}>
        Delete {workspace.name}
      </button>
    </div>
  ),
}));

function makeWorkspace(id: number): Workspace {
  return {
    id,
    user_id: 1,
    name: `Workspace ${id}`,
    description: 'desc',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('WorkspaceGrid', () => {
  it('renders one WorkspaceCard per workspace', () => {
    const workspaces = [makeWorkspace(1), makeWorkspace(2), makeWorkspace(3)];

    render(
      <WorkspaceGrid
        workspaces={workspaces}
        onWorkspaceClick={jest.fn()}
        onWorkspaceDelete={jest.fn()}
        onWorkspaceEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('Workspace 2')).toBeInTheDocument();
    expect(screen.getByText('Workspace 3')).toBeInTheDocument();
  });

  it('renders nothing when the workspace list is empty', () => {
    const { container } = render(
      <WorkspaceGrid
        workspaces={[]}
        onWorkspaceClick={jest.fn()}
        onWorkspaceDelete={jest.fn()}
        onWorkspaceEdit={jest.fn()}
      />,
    );

    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('forwards the workspace id on click', async () => {
    const user = userEvent.setup();
    const onWorkspaceClick = jest.fn();
    const workspaces = [makeWorkspace(7)];

    render(
      <WorkspaceGrid
        workspaces={workspaces}
        onWorkspaceClick={onWorkspaceClick}
        onWorkspaceDelete={jest.fn()}
        onWorkspaceEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Workspace 7'));

    expect(onWorkspaceClick).toHaveBeenCalledWith(7);
  });

  it('forwards the full workspace object on delete', async () => {
    const user = userEvent.setup();
    const onWorkspaceDelete = jest.fn();
    const workspace = makeWorkspace(9);

    render(
      <WorkspaceGrid
        workspaces={[workspace]}
        onWorkspaceClick={jest.fn()}
        onWorkspaceDelete={onWorkspaceDelete}
        onWorkspaceEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Delete Workspace 9'));

    expect(onWorkspaceDelete).toHaveBeenCalledWith(workspace);
  });
});
