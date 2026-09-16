import useEmblaCarousel from 'embla-carousel-react';
import { Check, ChevronLeft, ChevronRight, Clock3, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { PricingPlan } from '@/types/api.types';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';

interface StaticPlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  strikePriceMonthly: number;
  features: string[];
}

const STATIC_PLANS_DATA: StaticPlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    description:
      'For students exploring and validating their first startup idea, turning an initial concept into a real-world opportunity.',
    priceMonthly: 0,
    strikePriceMonthly: 299,
    features: [
      '1 workspace/idea for 7 days',
      '2 survey regenerations per workspace',
      '1 stage rerun per workspace',
      'Basic survey analytics',
      '100 survey responses per workspace',
      '200 MB storage',
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    description:
      'For students building projects and early-stage startups who need deeper validation and research.',
    priceMonthly: 299,
    strikePriceMonthly: 999,
    features: [
      '3 workspaces/ideas',
      '5 survey regenerations per workspace',
      '3 stage reruns per workspace',
      'Advanced survey analytics',
      '500 survey responses per workspace',
      'Export validation reports',
      '500 MB storage',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description:
      'For student founders and power users who need advanced validation, insights, and greater workspace capacity.',
    priceMonthly: 799,
    strikePriceMonthly: 1999,
    features: [
      '10 workspaces/ideas',
      '10 survey regenerations per workspace',
      '5 stage reruns per workspace',
      'Advanced survey analytics',
      '2,000 survey responses per workspace',
      'Export validation reports',
      '2 GB storage',
    ],
  },
];

const DEFAULT_STATIC_PLAN: StaticPlanConfig = {
  id: 'starter',
  name: 'Starter',
  description: 'For students exploring and validating their first startup idea.',
  priceMonthly: 0,
  strikePriceMonthly: 299,
  features: [
    '1 workspace/idea for 7 days',
    '2 survey regenerations per workspace',
    '1 stage rerun per workspace',
    'Basic survey analytics',
    '100 survey responses per workspace',
    '200 MB storage',
  ],
};

function getStaticPlan(index: number): StaticPlanConfig {
  return STATIC_PLANS_DATA[index] ?? DEFAULT_STATIC_PLAN;
}

function getPlanButtonText(staticPlan: StaticPlanConfig, isActive: boolean): string {
  if (staticPlan.id === 'starter') {
    return 'Current Starter (Free)';
  }
  if (isActive) {
    return `Current ${staticPlan.name}`;
  }
  return `Choose ${staticPlan.name}`;
}

function PlanCard({
  plan,
  index = 0,
  isActive = false,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plan: PricingPlan;
  index?: number;
  isActive?: boolean;
  onSelect: (id: string) => void;
  isSubmitting: boolean;
  submittingId: string | null;
}) {
  const planId = String(plan.id);
  const isThisSubmitting = submittingId === planId;

  const staticData = getStaticPlan(index);
  const buttonLabel = getPlanButtonText(staticData, isActive);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-visible rounded-2xl bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-neutral-900',
        isActive && 'shadow-md ring-2 ring-[#FF4500]/30',
      )}
    >
      <div
        className={cn(
          'relative rounded-t-2xl px-6 pt-5 pb-7 transition-all',
          isActive
            ? 'bg-gradient-to-r from-[#FF4500] via-[#FF5722] to-[#FFA07A]'
            : 'bg-[#ECECEC] dark:bg-neutral-800/90',
        )}
      >
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              'text-lg font-bold tracking-tight',
              isActive ? 'text-white' : 'text-neutral-900 dark:text-white',
            )}
          >
            {staticData.name}
            {plan.name && plan.name !== staticData.name ? (
              <span className="sr-only">{plan.name}</span>
            ) : null}
          </h3>
          {isActive ? (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs">
              Active Plan
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl rounded-b-2xl bg-white px-6 pt-5 pb-8 shadow-xs dark:bg-neutral-900">
        <p className="min-h-[44px] text-xs leading-relaxed text-neutral-600 sm:text-[13px] dark:text-neutral-400">
          {staticData.description}
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200/90 bg-[#FCFCFC] p-5 dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-[32px] dark:text-white">
              ₹{staticData.priceMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              / month
            </span>
            {plan.priceMonthly !== undefined ? (
              <span className="sr-only">₹{plan.priceMonthly.toLocaleString('en-IN')}</span>
            ) : null}
          </div>

          <div className="mt-1">
            <span className="text-xs font-normal text-neutral-400 line-through dark:text-neutral-500">
              ₹{staticData.strikePriceMonthly.toLocaleString('en-IN')} / month
            </span>
          </div>

          <button
            type="button"
            aria-label="Choose plan"
            onClick={() => onSelect(planId)}
            disabled={isSubmitting}
            className={cn(
              'mt-4 flex h-10 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
              isActive
                ? 'bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90'
                : 'bg-[#E3E5E8] font-semibold text-neutral-900 hover:bg-[#D5D9DF] dark:bg-neutral-800 dark:text-neutral-100',
            )}
          >
            {isThisSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing…
              </>
            ) : (
              buttonLabel
            )}
          </button>
        </div>

        <div className="mt-6 flex-1">
          <ul className="space-y-3">
            {staticData.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-neutral-900 dark:text-neutral-200" />
                <span className="text-xs leading-snug text-neutral-700 sm:text-[13px] dark:text-neutral-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileCarousel({
  plans,
  activePlanId,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plans: PricingPlan[];
  activePlanId: string;
  onSelect: (id: string) => void;
  isSubmitting: boolean;
  submittingId: string | null;
}) {
  const initialIdx = 0;
  const [activeIdx, setActiveIdx] = useState(initialIdx);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: initialIdx,
    align: 'center',
    containScroll: 'trimSnaps',
  });

  const onSlideSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSlideSelect);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSlideSelect();
    return () => {
      emblaApi.off('select', onSlideSelect);
    };
  }, [emblaApi, onSlideSelect]);

  const scrollTo = useCallback(
    (idx: number) => {
      emblaApi?.scrollTo(idx);
    },
    [emblaApi],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div ref={emblaRef} className="overflow-hidden px-[8vw]">
        <div className="-ml-4 flex items-stretch">
          {plans.map((plan, idx) => {
            const staticPlan = getStaticPlan(idx);
            const isActive = staticPlan.id === activePlanId || String(plan.id) === activePlanId;
            return (
              <div key={String(plan.id)} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
                <div
                  className={cn(
                    'h-full transition-all duration-300 ease-in-out',
                    idx === activeIdx ? 'scale-100 opacity-100' : 'scale-95 opacity-60',
                  )}
                >
                  <PlanCard
                    plan={plan}
                    index={idx}
                    isActive={isActive}
                    onSelect={onSelect}
                    isSubmitting={isSubmitting}
                    submittingId={submittingId}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous plan"
          onClick={scrollPrev}
          disabled={activeIdx === 0}
          className="border-border bg-card text-foreground hover:bg-muted flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Pricing plan slides">
          {plans.map((plan, idx) => {
            const staticPlan = getStaticPlan(idx);
            return (
              <button
                key={String(plan.id)}
                type="button"
                role="tab"
                aria-label={`Go to ${staticPlan.name}`}
                aria-selected={idx === activeIdx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  'h-2 cursor-pointer rounded-full transition-all duration-300',
                  idx === activeIdx ? 'bg-primary w-6' : 'bg-border hover:bg-muted-foreground w-2',
                )}
              />
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next plan"
          onClick={scrollNext}
          disabled={activeIdx === plans.length - 1}
          className="border-border bg-card text-foreground hover:bg-muted flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function PricingPlans() {
  const navigate = useNavigate();
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);
  const [isUnavailableAlertOpen, setIsUnavailableAlertOpen] = useState(false);

  // Default active plan is Starter (Free)
  const activePlanId = 'starter';

  const { data: plans, isLoading, isError, error, refetch } = usePricingPlans();
  const subscribe = useSubscribe();

  const proceedToOnboarding = useCallback(() => {
    setHasActivePlan(true);
    setOnboardingPending?.(false);
    void navigate(ROUTES.DASHBOARD);
  }, [navigate, setHasActivePlan, setOnboardingPending]);

  const handleSelect = useCallback(
    (planId: string) => {
      if (subscribe.isPending) return;

      const planList = plans ?? [];
      const index = planList.findIndex((p) => String(p.id) === planId);
      const staticData = getStaticPlan(index >= 0 ? index : 0);

      if (staticData.id === 'starter' || planId === 'starter' || planId === 'free') {
        proceedToOnboarding();
        return;
      }

      setIsUnavailableAlertOpen(true);
    },
    [plans, proceedToOnboarding, subscribe.isPending],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
        Choose your plan
        <span className="sr-only">Pricing Plans</span>
      </h1>
      <p className="mt-2 text-sm font-normal text-neutral-600 sm:text-base dark:text-neutral-400">
        Choose the Plan that fits your business needs
      </p>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : isError ? (
        <div className="mt-12">
          <ApiErrorMessage error={error} />
          <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-12 hidden gap-6 text-left sm:grid sm:grid-cols-2 md:grid-cols-3 lg:gap-8">
            {(plans ?? []).map((plan, idx) => {
              const staticPlan = getStaticPlan(idx);
              const isActive = staticPlan.id === activePlanId || String(plan.id) === activePlanId;
              return (
                <PlanCard
                  key={String(plan.id)}
                  plan={plan}
                  index={idx}
                  isActive={isActive}
                  onSelect={handleSelect}
                  isSubmitting={subscribe.isPending}
                  submittingId={subscribe.isPending ? (subscribe.variables?.planId ?? null) : null}
                />
              );
            })}
          </div>

          {/* Mobile: full-bleed carousel */}
          <div className="mt-10 sm:hidden">
            <MobileCarousel
              plans={plans ?? []}
              activePlanId={activePlanId}
              onSelect={handleSelect}
              isSubmitting={subscribe.isPending}
              submittingId={subscribe.isPending ? (subscribe.variables?.planId ?? null) : null}
            />
          </div>
        </>
      )}

      {/* Unavailable Plan Alert Dialog */}
      <AlertDialog open={isUnavailableAlertOpen} onOpenChange={setIsUnavailableAlertOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl p-6 text-center">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#FF4500]/10 text-[#FF4500]">
              <Clock3 className="size-6 text-[#FF4500]" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-white">
              Stay Tuned !
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
              This plan will be available after 7 days.
              <span className="sr-only">
                Stay Tuned ! This plan will be available after 7 days.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:justify-center">
            <AlertDialogAction
              onClick={() => setIsUnavailableAlertOpen(false)}
              className="min-w-[120px] rounded-xl bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
