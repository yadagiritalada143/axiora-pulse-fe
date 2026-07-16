import { ArrowRight, BookOpenText, Play } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/**
 * Two-step welcome overlay shown once after a successful registration, the
 * first time the user lands on the dashboard (gated by `onboardingPending`
 * in the auth store).
 */
export function OnboardingFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);

  const handleChoosePlan = () => {
    setOnboardingPending(false);
    void navigate(ROUTES.PRICING);
  };

  const handlePlay = () => {
    // Intentionally a no-op: whether this plays an embedded video, opens a
    // YouTube link, or navigates elsewhere hasn't been decided yet.
  };

  return createPortal(
    <div className="bg-muted fixed inset-0 z-50 flex flex-col px-4 pt-2 pb-4 sm:px-6 sm:pb-6">
      <p className="text-muted-foreground py-2 text-xs font-medium">Welcome Onboarding</p>

      <div className="bg-background relative flex-1 overflow-hidden rounded-lg shadow-sm">
        {step === 1 ? (
          <WelcomeStep onContinue={() => setStep(2)} />
        ) : (
          <GuideStep onPlay={handlePlay} onChoosePlan={handleChoosePlan} />
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
    <p className="text-muted-foreground max-w-md text-xs sm:text-sm">
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
        <Button className="mt-3 w-36 text-white" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function GuideStep({ onPlay, onChoosePlan }: { onPlay: () => void; onChoosePlan: () => void }) {
  return (
    <div className="flex h-full flex-col items-center gap-6 overflow-y-auto px-6 py-8 text-center sm:py-12">
      <GlowDot />

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Axiora Pulse
        </h1>
        <Tagline />
      </div>

      <div className="w-full max-w-3xl">
        <div className="bg-muted relative flex aspect-video w-full items-center justify-center rounded-xl">
          <div className="text-primary flex items-center gap-5 select-none">
            <BookOpenText className="size-12 sm:size-16" strokeWidth={1.5} />
            <div className="font-display text-left leading-tight">
              <p className="text-xl font-bold tracking-[0.3em] sm:text-3xl">GUIDE TO</p>
              <p className="text-3xl font-extrabold tracking-[0.15em] sm:text-5xl">PULSE</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Play the guide video"
            onClick={onPlay}
            className="bg-foreground/90 text-background absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 sm:size-16"
          >
            <Play className="ml-1 size-6 fill-current sm:size-7" />
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="text-white" onClick={onChoosePlan}>
            Choose Plan
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
