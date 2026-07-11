import { LoginForm } from '@features/auth/components';

export default function LoginPage() {
  return (
    <div className="font-display">
      <div className="mb-8 space-y-1">
        <h1 className="text-foreground text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to continue to your workspace.</p>
      </div>
      <LoginForm />
    </div>
  );
}
