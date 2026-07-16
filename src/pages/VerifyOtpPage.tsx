import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm';

export default function VerifyOtpPage() {
  return (
    <div className="w-full">
      <VerifyOtpForm
        heading={'Enter the code'}
        description={'Fill the necessary things to sign in to your account'}
      />
    </div>
  );
}
