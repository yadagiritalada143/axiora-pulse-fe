import { ResetPasswordForm } from '@features/auth/components';

export default function ResetPasswordPage() {
  return (
    <div className="font-display">
      <div className="mb-4 space-y-1">
        <h1 className="text-3xl font-semibold text-black">Set a new password</h1>
        <p className="text-muted-foreground text-sm">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>
      <hr className="mb-8 border-gray-300" />
      <ResetPasswordForm />
    </div>
  );
}
