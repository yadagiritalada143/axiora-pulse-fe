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

interface DeleteUserDialogProps {
  open: boolean;
  loading?: boolean;
  userName?: string;
  userEmail?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteUserDialog({
  open,
  loading = false,
  userName,
  userEmail,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            Delete User Account
          </AlertDialogTitle>

          <AlertDialogDescription className="text-foreground/80 space-y-4 text-sm leading-6">
            <p>
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground font-semibold">
                {userName ?? userEmail ?? 'this user'}
              </strong>
              {userEmail && userName ? ` (${userEmail})` : ''}?
            </p>

            <p className="text-destructive leading-6 font-medium">
              This action is permanent and cannot be undone. All workspaces, surveys, responses, and
              account records associated with this user will be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 gap-3">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
