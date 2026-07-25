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
    workspace: { id: number; name: string };
    onClick: (id: number) => void;
    onDelete: (id: number) => void;
  }) => (
    <div>
      <span>{workspace.name}</span>
      <button onClick={() => onClick(workspace.id)}>open-{workspace.id}</button>
      <button onClick={() => onDelete(workspace.id)}>delete-{workspace.id}</button>
    </div>
  ),
}));

const workspaces: Workspace[] = [
  {
    id: 1,
    user_id: 1,
    name: 'Alpha',
    description: 'a',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: 'Beta',
    description: 'b',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
];

describe('WorkspaceGrid', () => {
  it('renders a card for every workspace', () => {
    render(
      <WorkspaceGrid
        workspaces={workspaces}
        onWorkspaceClick={jest.fn()}
        onWorkspaceDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('forwards a card click as the workspace id', async () => {
    const onWorkspaceClick = jest.fn();
    render(
      <WorkspaceGrid
        workspaces={workspaces}
        onWorkspaceClick={onWorkspaceClick}
        onWorkspaceDelete={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByText('open-1'));

    expect(onWorkspaceClick).toHaveBeenCalledWith(1);
  });

  it('forwards a delete action with the full workspace object', async () => {
    const onWorkspaceDelete = jest.fn();
    render(
      <WorkspaceGrid
        workspaces={workspaces}
        onWorkspaceClick={jest.fn()}
        onWorkspaceDelete={onWorkspaceDelete}
      />,
    );

    await userEvent.click(screen.getByText('delete-2'));

    expect(onWorkspaceDelete).toHaveBeenCalledWith(workspaces[1]);
  });
});
