import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function OnboardingFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);
  const navigate = useNavigate();

  const handleChoosePlan = () => {
    setOnboardingPending?.(false);
    void navigate(ROUTES.PRICING);
  };

  return createPortal(
    <div className="bg-muted fixed inset-0 z-50 flex flex-col px-4 pt-2 pb-4 sm:px-6 sm:pb-6">
      <p className="text-muted-foreground py-2 text-xs font-medium">Welcome Onboarding</p>

      <div className="bg-background relative flex-1 overflow-hidden rounded-lg shadow-sm">
        {step === 1 ? (
          <WelcomeStep onContinue={() => setStep(2)} />
        ) : (
          <GuideStep onChoosePlan={handleChoosePlan} />
        )}
      </div>
    </div>,
    document.body,
  );
}

function GlowDot() {
  return (
    <span className="relative flex size-6 items-center justify-center" aria-hidden>
      <span className="bg-primary/50 absolute inset-0 rounded-full blur-md" />
      <span className="border-primary bg-background relative size-4 rounded-full border-4" />
    </span>
  );
}

function Tagline() {
  return (
    <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
      Build smarter. Decide faster. Scale confidently with your AI-powered Mentor Operating System.
    </p>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
      <div
        aria-hidden
        className="from-primary/40 via-primary/10 absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t to-transparent"
      />

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:72px_72px] opacity-20"
      />

      <div className="relative flex flex-col items-center gap-5">
        <GlowDot />

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Axiora Pulse
        </h1>

        <Tagline />

        <Button className="mt-3 w-36 cursor-pointer text-white" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function GuideStep({ onChoosePlan }: { onChoosePlan: () => void }) {
  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto px-4 py-6 text-center sm:gap-6 sm:px-6 sm:py-12">
      <GlowDot />

      <div className="space-y-1.5 sm:space-y-3">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Welcome to Axiora Pulse
        </h1>

        <Tagline />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <div className="bg-muted overflow-hidden rounded-xl border p-1.5 shadow-lg sm:rounded-2xl sm:p-3">
          <div className="aspect-video max-h-[45vh] w-full overflow-hidden rounded-lg bg-black sm:max-h-none sm:rounded-xl">
            <video className="h-full w-full object-contain" controls preload="metadata" playsInline>
              <source
                src="https://axiora-assets.s3.ap-south-1.amazonaws.com/Assets/Axiora-guide.mp4"
                type="video/mp4"
              />
              <track
                kind="captions"
                src="/captions/axiora-guide.vtt"
                srcLang="en"
                label="English"
                default
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div className="mt-4 flex justify-center sm:mt-6 sm:justify-end">
          <Button className="w-full text-white sm:w-auto" onClick={onChoosePlan}>
            Choose Plan
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
