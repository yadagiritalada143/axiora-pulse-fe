import { CheckCircle2, Download, FileText, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { useCurrentUser } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';

import { useUserDetails } from '../hooks/useUserDetails';

import { ChangePasswordDialog } from './ChangePasswordDialog';
import { EditProfileDialog } from './EditProfileDialog';

export function AccountTab() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const storeUser = useAuthStore((state) => state.user);
  const user = currentUser ?? storeUser;

  const { data: userDetails } = useUserDetails();

  const email = userDetails?.email ?? user?.email ?? 'N/A';
  const mobileNumber =
    userDetails?.mobile_number ?? user?.mobile_number ?? user?.mobileNumber ?? 'N/A';

  const handleDownloadTerms = () => {
    const termsText =
      'Pulse - Terms & Conditions\n\n' +
      '1. Acceptance of Terms\n' +
      'By accessing and using Pulse, you agree to be bound by these Terms and Conditions and our Privacy Policy.\n\n' +
      '2. Use of the Platform\n' +
      'You agree to use Pulse only for lawful purposes and in accordance with these Terms. You shall not misuse or attempt to gain unauthorized access to the platform.\n\n' +
      '3. Data & Privacy\n' +
      'We respect your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your information.\n\n' +
      '4. Account Responsibility\n' +
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.\n\n' +
      'Version: 2.4 (Active)\n' +
      'Last Updated: January 2025';

    const blob = new Blob([termsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Pulse-Terms-and-Conditions.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Terms & Conditions downloaded.');
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card rounded-none border-0 border-b pb-6 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                Account Information
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Manage your credentials, contact information and security settings.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck className="mr-1 size-3.5" />
              Verified Account
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-sky-500/40">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
                <Mail className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Email Address
                </p>
                <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
                  {email}
                </p>
              </div>
            </div>

            <div className="border-border/70 bg-card/60 flex items-center justify-between gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-emerald-500/40">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <Phone className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground flex items-center text-[11px] font-medium tracking-wider uppercase">
                    <span>Mobile Number</span>
                    <span
                      className="ml-1 inline-block text-xs font-bold text-red-500 select-none"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </p>
                  <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
                    {mobileNumber}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
                className="h-8.5 shrink-0 cursor-pointer px-3.5 text-xs font-semibold shadow-2xs hover:border-[#FF4500]/50 hover:text-[#FF4500]"
              >
                Change
              </Button>
            </div>

            <div className="border-border/70 bg-card/60 flex items-center justify-between gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-orange-500/40 md:col-span-2 lg:col-span-1">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF4500]">
                  <Lock className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                    Password
                  </p>
                  <p className="text-foreground mt-0.5 text-xs font-bold tracking-widest sm:text-sm">
                    ••••••••••••••
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
                className="h-8.5 shrink-0 cursor-pointer px-3.5 text-xs font-semibold shadow-2xs hover:border-[#FF4500]/50 hover:text-[#FF4500]"
              >
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card rounded-none border-0 border-b pb-6 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                <FileText className="size-5" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                  Terms & Conditions
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                  Platform terms of service and compliance policies.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTerms}
              className="h-9 cursor-pointer gap-1.5 self-start px-3.5 text-xs font-semibold shadow-2xs hover:border-[#FF4500]/50 hover:text-[#FF4500] sm:self-auto"
            >
              <Download className="size-3.5 text-[#FF4500]" />
              Download Terms
            </Button>
          </div>

          <div className="border-border/70 bg-muted/20 text-muted-foreground mt-5 max-h-52 space-y-3.5 overflow-y-auto rounded-xl border-0 border-b p-4 text-xs leading-relaxed shadow-inner sm:p-5">
            <div>
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                1. Acceptance of Terms
              </p>
              <p className="mt-1">
                By accessing and using Pulse, you agree to be bound by these Terms and Conditions
                and our Privacy Policy.
              </p>
            </div>

            <div>
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                2. Use of the Platform
              </p>
              <p className="mt-1">
                You agree to use Pulse only for lawful purposes and in accordance with these Terms.
                You shall not misuse or attempt to gain unauthorized access to the platform.
              </p>
            </div>

            <div>
              <p className="text-foreground text-xs font-semibold sm:text-sm">3. Data & Privacy</p>
              <p className="mt-1">
                We respect your privacy. Please review our Privacy Policy to understand how we
                collect, use, and protect your information.
              </p>
            </div>

            <div>
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                4. Account Responsibility
              </p>
              <p className="mt-1">
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities under your account.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Terms & Conditions accepted upon account creation &bull; Version 2.4 (Active)
            </span>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        user={user}
        userDetails={userDetails}
      />
    </div>
  );
}
