import { Loader, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { buildWorkspaceRoute } from '@/constants/routes';
import { Button } from '@components/ui/button';
import {
  CreateWorkspaceDialog,
  DeleteWorkspaceDialog,
  EditWorkspaceDialog,
  WorkspaceEmpty,
  WorkspaceGrid,
} from '@features/workspace/components';
import { useDeleteWorkspace, useWorkspaces } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';

export default function WorkspacePage() {
  const { data, isLoading, isError } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [editTarget, setEditTarget] = useState<Workspace | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center">
        Failed to load workspaces. Please try again.
      </div>
    );
  }

  const workspaces = data?.workspaces ?? [];
  const isEmpty = workspaces.length === 0;

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    deleteWorkspace.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">
            Organize your ideas, chats, and reports into workspaces.
          </p>
        </div>

        {!isEmpty ? (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Workspace
          </Button>
        ) : null}
      </div>

      {isEmpty ? (
        <WorkspaceEmpty onCreate={() => setIsCreateOpen(true)} />
      ) : (
        <WorkspaceGrid
          workspaces={workspaces}
          onWorkspaceClick={(workspaceId) => {
            void navigate(buildWorkspaceRoute(workspaceId));
          }}
          onWorkspaceDelete={(workspace) => setDeleteTarget(workspace)}
          onWorkspaceEdit={(workspace) => setEditTarget(workspace)}
        />
      )}

      <CreateWorkspaceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <DeleteWorkspaceDialog
        open={deleteTarget !== null}
        loading={deleteWorkspace.isPending}
        workspaceName={deleteTarget?.name}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {editTarget && (
        <EditWorkspaceDialog
          key={editTarget.id}
          open={true}
          workspace={editTarget}
          onOpenChange={(open) => {
            if (!open) {
              setEditTarget(null);
            }
          }}
        />
      )}
    </div>
  );
}
