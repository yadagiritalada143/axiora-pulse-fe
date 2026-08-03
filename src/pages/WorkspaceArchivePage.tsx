import { Archive, Loader } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ArchivedWorkspaceCard } from '@features/workspace/components';
import {
  useArchivedWorkspaces,
  useRestoreWorkspace,
} from '@features/workspace/hooks/useWorkspaces';

export default function WorkspaceArchivePage() {
  const { data, isLoading, isError } = useArchivedWorkspaces();
  const restoreWorkspace = useRestoreWorkspace();
  const [restoringId, setRestoringId] = useState<number | null>(null);

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

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-muted-foreground text-sm">
          Workspaces you&apos;ve deleted are stored here. You can restore them at any time.
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
              isRestoring={restoringId === workspace.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
