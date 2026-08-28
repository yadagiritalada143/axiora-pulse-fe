import { X } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';

interface AvatarPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  userName: string;
}

export function AvatarPreviewDialog({
  isOpen,
  onClose,
  avatarUrl,
  userName,
}: AvatarPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-sm flex-col items-center justify-center border-none bg-transparent p-0 shadow-none sm:max-w-md [&>button]:hidden">
        <DialogTitle className="sr-only">Avatar Preview</DialogTitle>
        <button
          onClick={onClose}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-50 rounded-sm bg-black/50 p-2 text-white opacity-70 transition-opacity hover:bg-black/70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <div className="relative flex w-full max-w-[400px] flex-col items-center">
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="h-auto max-h-[400px] w-full max-w-[400px] rounded-xl object-cover shadow-2xl"
          />
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-white drop-shadow-md">{userName}</h2>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
