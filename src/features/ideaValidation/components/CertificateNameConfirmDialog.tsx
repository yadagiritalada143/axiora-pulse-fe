import { AlertTriangle, Award, CheckCircle2, Download, Loader2, UserPen, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { UserFeedbackSubmitResult } from '@/types/feedback.types';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { ROUTES } from '@constants/routes';
import { useCurrentUser } from '@features/auth/hooks';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useDownloadCertificate } from '@features/workspace/hooks/useWorkspaceMentor';
import { useAuthStore } from '@store/auth.store';
import { downloadFile } from '@utils/file';
import { getDisplayName, getUserInitial } from '@utils/user';

export interface CertificateNameConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  initialBlobResult?: UserFeedbackSubmitResult | null;
  onDownloadSuccess?: () => void;
}

export function CertificateNameConfirmDialog({
  open,
  onOpenChange,
  workspaceId,
  initialBlobResult,
  onDownloadSuccess,
}: CertificateNameConfirmDialogProps) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data: userDetails, isLoading: isDetailsLoading } = useUserDetails();
  const storeUser = useAuthStore((state) => state.user);
  const user = currentUser ?? storeUser;

  const [isDownloadingDirectBlob, setIsDownloadingDirectBlob] = useState(false);
  const downloadCertificateMutation = useDownloadCertificate(workspaceId);

  const rawAvatar =
    currentUser !== undefined
      ? currentUser?.avatarUrl
      : (storeUser?.avatarUrl ?? storeUser?.avatar_url);
  const avatarSrc =
    rawAvatar && typeof rawAvatar === 'string' && rawAvatar.trim() !== '' ? rawAvatar : undefined;

  const firstName =
    userDetails?.first_name?.trim() ?? user?.firstName?.trim() ?? user?.first_name?.trim() ?? '';
  const lastName =
    userDetails?.last_name?.trim() ?? user?.lastName?.trim() ?? user?.last_name?.trim() ?? '';
  const email = userDetails?.email ?? user?.email ?? '';

  const hasCompleteName = Boolean(firstName && lastName);
  const displayName = getDisplayName(user, userDetails);
  const userInitial = getUserInitial(displayName, user);

  const formattedCertificateName = hasCompleteName ? `${firstName} ${lastName}` : displayName;

  const isDownloading = isDownloadingDirectBlob || downloadCertificateMutation.isPending;

  const handleClose = () => {
    if (isDownloading) return;
    onOpenChange(false);
  };

  const handleNoUpdateProfile = () => {
    onOpenChange(false);
    toast.info(
      'Redirecting to Profile. Update your First and Last Name, then return to download your certificate.',
    );
    void navigate(`${ROUTES.SETTINGS}?tab=profile`);
  };

  const handleYesContinueAndDownload = () => {
    if (initialBlobResult?.blob) {
      setIsDownloadingDirectBlob(true);
      try {
        downloadFile(
          initialBlobResult.blob,
          initialBlobResult.filename || `idea_validation_certificate_${workspaceId}.pdf`,
          'application/pdf',
        );
        toast.success('Certificate downloaded successfully!');
        onDownloadSuccess?.();
        onOpenChange(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to download certificate.';
        toast.error(msg);
      } finally {
        setIsDownloadingDirectBlob(false);
      }
      return;
    }

    const certificatePayload = formattedCertificateName
      ? { name: formattedCertificateName }
      : undefined;
    downloadCertificateMutation.mutate(certificatePayload, {
      onSuccess: () => {
        onDownloadSuccess?.();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="border-border/80 bg-card fixed top-1/2 left-1/2 max-h-[92vh] w-[95vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-2xl p-6 shadow-2xl sm:rounded-3xl sm:p-7"
        aria-describedby="certificate-confirm-description"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isDownloading}
          aria-label="Close dialog"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 absolute top-4 right-4 z-10 rounded-full p-1.5 transition-colors disabled:opacity-50"
        >
          <X className="size-4" />
        </button>

        <div className="flex min-w-0 flex-col items-center space-y-5 text-center">
          {/* Badge & Official Seal Illustration */}
          <div className="relative flex size-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-orange-500/20 text-[#FF4500] shadow-xs">
            <Award className="size-8 text-[#FF4500]" />
          </div>

          <DialogHeader className="space-y-2 text-center sm:text-center">
            <div className="inline-flex items-center justify-center gap-1.5 self-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Award className="size-3" /> Official Certificate Verification
            </div>

            <DialogTitle className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              Verify Certificate Name
            </DialogTitle>

            <DialogDescription
              id="certificate-confirm-description"
              className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed sm:text-sm"
            >
              Your official Venture Validation Certificate will be issued with the First Name and
              Last Name registered in your profile. Please check your recipient details below.
            </DialogDescription>
          </DialogHeader>

          {/* Recipient Profile Card */}
          <div className="border-border bg-muted/30 w-full space-y-3 rounded-2xl border p-4 text-left shadow-2xs">
            <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Name on Certificate
              </span>

              {isDetailsLoading ? (
                <span className="text-muted-foreground text-[11px]">Loading...</span>
              ) : hasCompleteName ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Verified Full Name
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3" /> Name Incomplete
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <Avatar className="border-border/80 size-11 border shadow-xs">
                <AvatarImage src={avatarSrc} alt="" />
                <AvatarFallback className="bg-orange-500/10 text-sm font-bold text-[#FF4500]">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-base font-bold sm:text-lg">
                  {formattedCertificateName}
                </p>
                {email && (
                  <p className="text-muted-foreground truncate font-mono text-xs">{email}</p>
                )}
              </div>
            </div>

            {!hasCompleteName && !isDetailsLoading && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950 dark:text-amber-100">
                    Your profile name is not complete.
                  </p>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90">
                    The certificate will currently show: &ldquo;{formattedCertificateName}&rdquo;.
                    If you want your legal first and last name printed on this official credential,
                    please update your profile before downloading.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="text-foreground px-2 text-center text-xs font-medium sm:text-sm">
            Is this the exact name you want printed on your certificate?
          </p>

          <div className="flex w-full flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleNoUpdateProfile}
              disabled={isDownloading}
              className="border-border hover:bg-muted text-foreground h-10 w-full rounded-xl text-xs font-semibold sm:flex-1 sm:text-sm"
            >
              <UserPen className="text-muted-foreground mr-1.5 size-4" />
              No, Update in Profile
            </Button>

            <Button
              type="button"
              onClick={handleYesContinueAndDownload}
              disabled={isDownloading}
              className="h-10 w-full rounded-xl bg-gradient-to-r from-amber-500 to-[#FF4500] text-xs font-semibold text-white shadow-md transition-all hover:from-amber-600 hover:to-[#FF4500]/90 disabled:opacity-50 sm:flex-1 sm:text-sm"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 size-4" />
                  Yes, Continue & Download
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
