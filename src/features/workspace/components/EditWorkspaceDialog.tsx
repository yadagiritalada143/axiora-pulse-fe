import { useState } from 'react';

import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { useUpdateWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';

interface EditWorkspaceDialogProps {
  open: boolean;
  workspace: Workspace | null;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkspaceDialog({ open, workspace, onOpenChange }: EditWorkspaceDialogProps) {
  const updateWorkspace = useUpdateWorkspace();

  const [name, setName] = useState(() => workspace?.name ?? '');

  const [description, setDescription] = useState(() => workspace?.description ?? '');

  function handleSave() {
    if (!workspace || !name.trim()) return;

    updateWorkspace.mutate(
      {
        id: workspace.id,
        payload: {
          name: name.trim(),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>Update your workspace details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="workspace-name" className="mb-2 block text-sm font-medium">
              Workspace Name
            </label>

            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name"
            />
          </div>

          <div>
            <label htmlFor="workspace-description" className="mb-2 block text-sm font-medium">
              Description
            </label>

            <Textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Workspace description"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateWorkspace.isPending}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={!name.trim() || updateWorkspace.isPending}>
            {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
