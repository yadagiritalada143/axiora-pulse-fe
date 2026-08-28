import { Plus } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';

interface WorkspaceEmptyProps {
  onCreate: () => void;
}

export function WorkspaceEmpty({ onCreate }: WorkspaceEmptyProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-foreground text-2xl font-semibold">No Workspaces Yet</h2>

        <p className="text-muted-foreground max-w-md">
          Create your first workspace to start using Axiora Pulse.
        </p>

        <Button onClick={onCreate} className="cursor-pointer">
          <Plus className="mr-2 size-4" />
          Create Workspace
        </Button>
      </CardContent>
    </Card>
  );
}
