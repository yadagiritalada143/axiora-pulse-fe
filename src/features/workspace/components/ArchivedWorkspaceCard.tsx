import { Building2, Clock, MoreHorizontal, RotateCcw } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { formatRelativeTime } from '@utils/date';

import type { Workspace } from '../types';

interface ArchivedWorkspaceCardProps {
  workspace: Workspace;
  onRestore: (workspaceId: number) => void;
  isRestoring?: boolean;
}

export function ArchivedWorkspaceCard({
  workspace,
  onRestore,
  isRestoring,
}: ArchivedWorkspaceCardProps) {
  const updatedLabel = formatRelativeTime(workspace.updated_at || workspace.created_at);

  return (
    <Card className="relative gap-0 overflow-hidden py-0 opacity-75">
      <div className="flex items-start gap-4 p-5">
        <div className="from-muted/50 to-muted text-muted-foreground ring-border flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <Building2 className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-base leading-tight font-semibold">
            {workspace.name}
          </h3>
          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
            {workspace.description || 'No description provided.'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Workspace actions"
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 size-8 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem disabled={isRestoring} onClick={() => onRestore(workspace.id)}>
              <RotateCcw className="size-4" />
              {isRestoring ? 'Restoring…' : 'Restore'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border-border/60 bg-muted/30 flex items-center border-t px-5 py-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Clock className="size-3.5" />
          {updatedLabel ? `Archived ${updatedLabel}` : 'Archived recently'}
        </span>
      </div>
    </Card>
  );
}
