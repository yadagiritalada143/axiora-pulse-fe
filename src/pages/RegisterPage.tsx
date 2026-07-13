import { appConfig } from '@/config/app.config';
import { RegisterForm } from '@features/auth/components';

export default function RegisterPage() {
  return (
    <div className="font-display">
      <div className="mb-4 space-y-1">
        <h1 className="font-display text-3xl font-semibold text-black">Get started</h1>
        <p className="text-muted-foreground text-sm">
          Welcome to {appConfig.name} , Let&apos;s get started
        </p>
      </div>
      <hr className="mb-8 border-gray-300" />
      <RegisterForm />
    </div>
  );
}
