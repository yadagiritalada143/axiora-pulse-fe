import { AdminLoginForm } from '@features/auth/components';

export default function AdminLoginPage() {
  return (
    <div className="font-display">
      <div className="mb-4 space-y-1">
        <h1 className="text-foreground text-3xl font-semibold">Admin Login</h1>
        <p className="text-muted-foreground text-sm">Sign in to access the admin dashboard.</p>
      </div>

      <hr className="mb-8" />

      <AdminLoginForm />
    </div>
  );
}
