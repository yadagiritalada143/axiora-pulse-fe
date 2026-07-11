import { appConfig } from '@/config/app.config';
import { RegisterForm } from '@features/auth/components';

export default function RegisterPage() {
  return (
    <div className="font-display">
      <div className="mb-8 space-y-1">
        <h1 className="font-display text-foreground text-2xl font-semibold">Get started</h1>
        <p className="text-muted-foreground text-sm">
          Welcome to {appConfig.name} - Let&apos;s begin
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
