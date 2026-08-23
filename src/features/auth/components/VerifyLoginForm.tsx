import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ButtonLoader } from '@/components/common/Loader';
import { Button } from '@components/ui/button';
import { OtpInput } from '@components/ui/otp-input';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

import { useResendOtp } from '../hooks/useResendOtp';
import { useVerifyLogin } from '../hooks/useVerifyLogin';

export function VerifyLoginForm() {
  const navigate = useNavigate();
  const verifyLogin = useVerifyLogin();
  const resendOtp = useResendOtp();
  const mfaData = useAuthStore((state) => state.mfaData);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (mfaData?.flow !== 'login') {
      toast.error('Login verification session expired.');
      void navigate(ROUTES.LOGIN);
    }
  }, [mfaData, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  if (!mfaData) {
    return null;
  }

  const identifier = mfaData.identifier;
  const handleVerify = () => {
    if (verifyLogin.isPending) {
      return;
    }

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    verifyLogin.mutate({
      emailOrMobile: identifier,
      otp: Number(otp),
    });
  };

  const handleResend = () => {
    if (seconds > 0 || resendOtp.isPending) {
      return;
    }

    resendOtp.mutate();
    setSeconds(60);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verify Login OTP</h1>

        <p className="text-muted-foreground mt-2 text-sm">
          Enter the 6-digit OTP sent to <span className="font-medium">{identifier}</span> to
          complete sign in.
        </p>

        <div className="mt-6 border-b" />
      </div>

      <div className="space-y-3">
        <label htmlFor="login-otp" className="block text-sm font-medium">
          Login OTP
        </label>

        <OtpInput value={otp} onChange={setOtp} />
      </div>

      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={verifyLogin.isPending || otp.length !== 6}
      >
        {verifyLogin.isPending && <ButtonLoader className="mr-2" />}
        Verify Login
      </Button>

      <div className="text-center text-sm">
        {seconds > 0 ? (
          <p className="text-muted-foreground">
            Resend OTP in{' '}
            <span className="font-semibold">00:{String(seconds).padStart(2, '0')}</span>
          </p>
        ) : (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={handleResend}
            disabled={resendOtp.isPending}
          >
            {resendOtp.isPending ? 'Sending...' : 'Resend OTP'}
          </Button>
        )}
      </div>
    </div>
  );
}
