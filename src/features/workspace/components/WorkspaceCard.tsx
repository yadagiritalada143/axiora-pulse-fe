import { Building2, ChevronRight, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { cn } from '@lib/utils';
import { formatRelativeTime } from '@utils/date';

import type { Workspace } from '../types';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: (workspaceId: number) => void;
  onDelete: (workspaceId: number) => void;
  onEdit: (workspaceId: number) => void;
}

export function WorkspaceCard({ workspace, onClick, onDelete, onEdit }: WorkspaceCardProps) {
  const updatedLabel = formatRelativeTime(workspace.updated_at || workspace.created_at);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(workspace.id);
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => {
        onClick(workspace.id);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        'group focus-visible:ring-ring relative cursor-pointer gap-0 overflow-hidden py-0',
        'transition-all duration-200 outline-none',
        'hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            'from-primary/15 to-primary/5 text-primary ring-primary/10 flex size-11 shrink-0',
            'items-center justify-center rounded-xl bg-gradient-to-br ring-1',
            'transition-transform duration-200 group-hover:scale-105',
          )}
        >
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
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
              }}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                onEdit(workspace.id);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(workspace.id);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border-border/60 bg-muted/30 flex items-center justify-between border-t px-5 py-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Clock className="size-3.5" />
          {updatedLabel ? `Updated ${updatedLabel}` : 'Recently updated'}
        </span>

        <ChevronRight
          className={cn(
            'text-muted-foreground size-4 transition-all duration-200',
            'opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100',
          )}
          aria-hidden
        />
      </div>
    </Card>
  );
}
