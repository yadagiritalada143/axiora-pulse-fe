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
          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete <strong>{workspaceName}</strong>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
