import { Archive, Loader } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { ArchivedWorkspaceCard } from '@features/workspace/components';
import {
  useArchivedWorkspaces,
  useRestoreWorkspace,
  usePermanentDeleteWorkspace,
} from '@features/workspace/hooks/useWorkspaces';

export default function WorkspaceArchivePage() {
  const { data, isLoading, isError } = useArchivedWorkspaces();
  const restoreWorkspace = useRestoreWorkspace();
  const deleteWorkspace = usePermanentDeleteWorkspace();

  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center text-sm">
        Failed to load archived workspaces. Please try again.
      </div>
    );
  }

  const archived = data?.workspaces ?? [];

  function handleRestore(workspaceId: number) {
    setRestoringId(workspaceId);
    restoreWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        toast.success('Workspace restored successfully.');
        setRestoringId(null);
      },
      onError: () => {
        toast.error('Failed to restore workspace. Please try again.');
        setRestoringId(null);
      },
    });
  }

  function handlePermanentDelete(workspaceId: number) {
    setDeletingId(workspaceId);
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        toast.success('Workspace deleted permanently.');
        setDeletingId(null);
        setConfirmDeleteId(null);
      },
      onError: () => {
        toast.error('Failed to permanently delete workspace. Please try again.');
        setDeletingId(null);
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-muted-foreground text-sm">
          Workspaces you&apos;ve deleted are stored here. You can restore them or delete them
          permanently.
        </p>
      </div>

      {archived.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <Archive className="text-muted-foreground size-7" />
          </div>
          <h2 className="text-foreground text-base font-semibold">No archived workspaces</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Workspaces you delete will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archived.map((workspace) => (
            <ArchivedWorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onRestore={handleRestore}
              onDeletePermanent={(id) => setConfirmDeleteId(id)}
              isRestoring={restoringId === workspace.id}
              isDeleting={deletingId === workspace.id}
            />
          ))}
        </div>
      )}

      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Workspace Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this workspace? This action cannot be
              undone and will delete all associated chats, surveys, and validation data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={deletingId !== null}
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 font-semibold text-white"
              disabled={deletingId !== null}
              onClick={() => confirmDeleteId && handlePermanentDelete(confirmDeleteId)}
            >
              {deletingId !== null ? 'Deleting…' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
