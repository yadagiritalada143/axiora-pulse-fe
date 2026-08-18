import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';

interface DeleteWorkspaceDialogProps {
  open: boolean;
  loading?: boolean;
  workspaceName?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteWorkspaceDialog({
  open,
  loading = false,
  workspaceName,
  onOpenChange,
  onConfirm,
}: DeleteWorkspaceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Workspace</AlertDialogTitle>

          <AlertDialogDescription>
            <strong>{workspaceName}</strong> will be moved to your Archive. No data will be lost —
            you can restore it at any time from the Archived Workspaces section.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {loading ? 'Archiving...' : 'Move to Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
