import { Building2 } from 'lucide-react';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Card, CardContent } from '@components/ui/card';
import { useWorkspaces } from '@features/workspace/hooks/useWorkspaces';
import { cn } from '@lib/utils';
import { useAppStore } from '@store/app.store';

export function WorkspaceList() {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useAppStore((state) => state.setActiveWorkspaceId);

  if (isLoading) return <Loader label="Loading workspaces" />;
  if (error) return <ApiErrorMessage error={error} />;
  if (!workspaces?.length) {
    return (
      <p className="text-muted-foreground text-sm">No workspaces yet. Create one to get started.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <Card
          key={workspace.id}
          role="button"
          tabIndex={0}
          onClick={() => setActiveWorkspaceId(workspace.id)}
          className={cn(
            'hover:border-primary cursor-pointer transition-colors',
            workspace.id === activeWorkspaceId && 'border-primary',
          )}
        >
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-md">
              <Building2 className="size-5" />
            </div>
            <span className="text-foreground font-medium">{workspace.name}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
