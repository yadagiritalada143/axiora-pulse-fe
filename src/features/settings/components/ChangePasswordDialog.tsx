import { CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ButtonLoader } from '@components/common/Loader';
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
import { Label } from '@components/ui/label';

import { useChangePassword } from '../hooks/useChangePassword';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    changePasswordMutation.mutate(
      {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="border-border/80 rounded-2xl p-6 shadow-xl sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF4500]">
              <KeyRound className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">Change Password</DialogTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Keep your account safe with a strong password
              </p>
            </div>
          </div>
          <DialogDescription className="sr-only">Update your account password.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="currentPassword"
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Lock className="size-3.5 text-orange-500" />
              Current Password{' '}
              <span
                className="ml-1 inline-block text-sm font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                aria-label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                className="h-9.5 pr-10 text-sm"
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1"
                tabIndex={-1}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-destructive mt-1 text-xs">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="newPassword"
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="size-3.5 text-blue-500" />
              New Password{' '}
              <span
                className="ml-1 inline-block text-sm font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                aria-label="New Password"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password (min. 8 characters)"
                className="h-9.5 pr-10 text-sm"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  validate: {
                    hasUpper: (v) =>
                      /[A-Z]/.test(v) || 'Must contain at least one uppercase letter',
                    hasLower: (v) =>
                      /[a-z]/.test(v) || 'Must contain at least one lowercase letter',
                    hasNumber: (v) => /\d/.test(v) || 'Must contain at least one number',
                    hasSpecial: (v) =>
                      /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/.test(v) ||
                      'Must contain at least one special character (!@#$%^&*)',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1"
                tabIndex={-1}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-destructive mt-1 text-xs">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Confirm New Password{' '}
              <span
                className="ml-1 inline-block text-sm font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                aria-label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className="h-9.5 pr-10 text-sm"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === getValues('newPassword') || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive mt-1 text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changePasswordMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="cursor-pointer bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90"
            >
              {changePasswordMutation.isPending ? <ButtonLoader className="mr-2" /> : null}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
