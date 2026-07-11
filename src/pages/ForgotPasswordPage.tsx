import { ForgotPasswordForm } from '@features/auth/components';

export default function ForgotPasswordPage() {
  return (
    <div className="font-display">
      <div className="mb-8 space-y-1">
        <h1 className="text-foreground text-2xl font-semibold">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
