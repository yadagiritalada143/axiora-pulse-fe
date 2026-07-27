import type { Workspace } from '../types';

import { WorkspaceCard } from './WorkspaceCard';

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onWorkspaceClick: (workspaceId: number) => void;
  onWorkspaceDelete: (workspace: Workspace) => void;
  onWorkspaceEdit?: (workspace: Workspace) => void;
}

export function WorkspaceGrid({
  workspaces,
  onWorkspaceClick,
  onWorkspaceDelete,
  onWorkspaceEdit,
}: WorkspaceGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onClick={onWorkspaceClick}
          onDelete={() => onWorkspaceDelete(workspace)}
          onEdit={() => onWorkspaceEdit?.(workspace)}
        />
      ))}
    </div>
  );
}
