import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { OtpInput } from '@components/ui/otp-input';
import { ROUTES } from '@constants/routes';
import { useForgotPassword, useVerifyForgotPassword, useResetPassword } from '@features/auth/hooks';
import {
  forgotPasswordSchema,
  newPasswordSchema,
  type ForgotPasswordFormValues,
  type NewPasswordFormValues,
} from '@schemas/auth.schema';
import { useAuthStore } from '@store/auth.store';

// ─── Step 1: Request reset code ──────────────────────────────────────────────

function RequestStep({ onSuccess }: { onSuccess: () => void }) {
  const forgotPassword = useForgotPassword();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { emailOrMobile: '' },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="emailOrMobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email / Mobile Number</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="Enter Email ID / Mobile Number"
                  className="placeholder:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-white" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? <ButtonLoader className="mr-2" /> : null}
          Send Reset Code
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}

// ─── Step 2: Verify OTP code ─────────────────────────────────────────────────

function VerifyStep({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const verifyForgotPassword = useVerifyForgotPassword();
  const emailOrMobile = useAuthStore((state) => state.resetEmailOrMobile);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);
  const forgotPassword = useForgotPassword();

  useEffect(() => {
    if (!emailOrMobile) return;
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, emailOrMobile]);

  const handleVerify = (code: string = otp) => {
    if (verifyForgotPassword.isPending) return;
    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }
    if (!emailOrMobile) {
      toast.error('Session expired. Please start over.');
      onBack();
      return;
    }

    verifyForgotPassword.mutate(
      { emailOrMobile, code: Number(code) },
      { onSuccess: () => onSuccess() },
    );
  };

  const handleResend = () => {
    if (seconds > 0 || forgotPassword.isPending || !emailOrMobile) return;

    forgotPassword.mutate(
      { emailOrMobile },
      {
        onSuccess: () => {
          setSeconds(60);
          setOtp('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="block text-sm font-medium">Enter the 6-digit code</p>
        <p className="text-muted-foreground text-xs">
          Code sent to <span className="font-medium">{emailOrMobile}</span>
        </p>
        <OtpInput
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (value.length === 6 && !verifyForgotPassword.isPending) {
              handleVerify(value);
            }
          }}
        />
      </div>

      <Button
        className="w-full"
        onClick={() => handleVerify()}
        disabled={verifyForgotPassword.isPending || otp.length !== 6}
      >
        {verifyForgotPassword.isPending && <ButtonLoader className="mr-2" />}
        Verify Code
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" size="sm" className="h-auto px-0" onClick={onBack}>
          ← Change email
        </Button>

        {seconds > 0 ? (
          <p className="text-muted-foreground">
            Resend in <span className="font-semibold">00:{String(seconds).padStart(2, '0')}</span>
          </p>
        ) : (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={handleResend}
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? 'Sending...' : 'Resend Code'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Set new password ─────────────────────────────────────────────────

function NewPasswordStep() {
  const resetPassword = useResetPassword();
  const resetToken = useAuthStore((state) => state.resetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { new_password: '', confirmPassword: '' },
  });

  const onSubmit = (values: NewPasswordFormValues) => {
    if (!resetToken) {
      toast.error('Session expired. Please start over.');
      return;
    }
    resetPassword.mutate({ reset_token: resetToken, new_password: values.new_password });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-white" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? <ButtonLoader className="mr-2" /> : null}
          Reset Password
        </Button>
      </form>
    </Form>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [{ label: 'Email' }, { label: 'Verify' }, { label: 'Reset' }];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {STEPS.map((step, idx) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              idx < current
                ? 'bg-primary text-primary-foreground'
                : idx === current
                  ? 'bg-primary text-primary-foreground ring-primary/30 ring-2 ring-offset-2'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {idx < current ? '✓' : idx + 1}
          </div>
          <span
            className={`text-xs font-medium ${idx === current ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {step.label}
          </span>
          {idx < STEPS.length - 1 && (
            <div
              className={`h-px w-6 transition-colors ${idx < current ? 'bg-primary' : 'bg-border'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

const STEP_META = [
  {
    heading: 'Forgot password?',
    description: "Enter your email or mobile number and we'll send you a reset code.",
  },
  {
    heading: 'Check your inbox',
    description: 'Enter the 6-digit code we sent to verify your identity.',
  },
  {
    heading: 'Create new password',
    description: 'Your new password must be at least 8 characters long.',
  },
];

export function ForgotPasswordForm() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <StepIndicator current={step} />

      <div className="mb-4 space-y-1">
        <h2 className="text-foreground text-2xl font-semibold">{STEP_META[step]?.heading}</h2>
        <p className="text-muted-foreground text-sm">{STEP_META[step]?.description}</p>
      </div>

      <hr className="mb-6" />

      {step === 0 && <RequestStep onSuccess={() => setStep(1)} />}
      {step === 1 && <VerifyStep onSuccess={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <NewPasswordStep />}
    </div>
  );
}
