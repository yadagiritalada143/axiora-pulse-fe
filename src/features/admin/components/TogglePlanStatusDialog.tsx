import { AlertTriangle, CheckCircle2, Loader2, Power } from 'lucide-react';

import type { AdminPlan } from '@/types/admin.types';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';

interface TogglePlanStatusDialogProps {
  plan: AdminPlan | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TogglePlanStatusDialog({
  plan,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: TogglePlanStatusDialogProps) {
  if (!plan) return null;

  const isDeactivating = plan.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isDeactivating
                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isDeactivating ? (
                <AlertTriangle className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                {isDeactivating ? 'Deactivate Subscription Plan' : 'Activate Subscription Plan'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Plan: <span className="text-foreground font-semibold">{plan.name}</span> (
                {plan.code})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-3.5 text-xs leading-relaxed">
          {isDeactivating ? (
            <p>
              Deactivating this plan will hide it from the user pricing page and prevent new
              founders from subscribing to it. Existing subscribers on this plan will continue
              without interruption.
            </p>
          ) : (
            <p>
              Activating this plan will make it visible to all users on the public pricing page and
              eligible for subscriptions immediately.
            </p>
          )}
        </div>

        <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className={`gap-1.5 text-xs font-semibold text-white ${
              isDeactivating
                ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {isDeactivating ? 'Deactivating...' : 'Activating...'}
              </>
            ) : (
              <>
                <Power className="size-3.5" />
                {isDeactivating ? 'Confirm Deactivate' : 'Confirm Activate'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
