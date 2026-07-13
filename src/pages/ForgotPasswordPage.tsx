import { ForgotPasswordForm } from '@features/auth/components';

export default function ForgotPasswordPage() {
  return (
    <div className="font-display">
      <div className="mb-4 space-y-1">
        <h1 className="text-3xl font-semibold text-black">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>
      <hr className="mb-8 border-gray-300" />
      <ForgotPasswordForm />
    </div>
  );
}
