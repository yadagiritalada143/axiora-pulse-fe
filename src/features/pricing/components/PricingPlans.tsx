import useEmblaCarousel from 'embla-carousel-react';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { PricingPlan } from '@/types/api.types';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { useAccountStatus } from '@features/pricing/hooks/useAccountStatus';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { useSelectFreePlan } from '@features/pricing/hooks/useSelectFreePlan';
import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';

const DEFAULT_FALLBACK_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description:
      'For students exploring and validating their first startup idea, turning an initial concept into a real-world opportunity.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 workspace/idea for 7 days',
      '2 survey regenerations per workspace',
      '1 stage rerun per workspace',
      'Basic survey analytics',
      '100 survey responses per workspace',
      '200 MB storage',
    ],
    popular: false,
  },
  {
    id: 'builder',
    name: 'Builder',
    description:
      'For students building projects and early-stage startups who need deeper validation and research.',
    priceMonthly: 299,
    priceYearly: 2990,
    features: [
      '3 workspaces/ideas',
      '5 survey regenerations per workspace',
      '3 stage reruns per workspace',
      'Advanced survey analytics',
      '500 survey responses per workspace',
      'Export validation reports',
      '500 MB storage',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description:
      'For student founders and power users who need advanced validation, insights, and greater workspace capacity.',
    priceMonthly: 799,
    priceYearly: 7990,
    features: [
      '10 workspaces/ideas',
      '10 survey regenerations per workspace',
      '5 stage reruns per workspace',
      'Advanced survey analytics',
      '2,000 survey responses per workspace',
      'Export validation reports',
      '2 GB storage',
    ],
    popular: false,
  },
];

function getPlanButtonText(
  plan: PricingPlan,
  planName: string,
  isFree: boolean,
  isActive: boolean,
): string {
  const planId = String(plan.id).toLowerCase();
  if (isActive) {
    if (planId === 'starter' || isFree) {
      return 'Current Starter (Free)';
    }
    return `Current ${planName}`;
  }
  if (isFree) {
    return `Choose ${planName} (Free)`;
  }
  return `Choose ${planName}`;
}

function PlanCard({
  plan,
  isActive = false,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plan: PricingPlan;
  isActive?: boolean;
  onSelect: (id: string) => void;
  isSubmitting: boolean;
  submittingId: string | null;
}) {
  const planId = String(plan.id);
  const isThisSubmitting = submittingId === planId;

  const planName = plan.name;
  const planDesc = plan.description ?? 'Access AI-guided validation workflows and workspace tools.';
  const priceMonthly = plan.priceMonthly ?? 0;
  const isFree =
    priceMonthly === 0 || planId.toLowerCase() === 'starter' || planId.toLowerCase() === 'free';
  const isPopular = Boolean(plan.popular);
  const features = Array.isArray(plan.features) ? plan.features : [];

  const buttonLabel = getPlanButtonText(plan, planName, isFree, isActive);
  const strikePrice = priceMonthly > 0 ? Math.round(priceMonthly * 1.4) : 299;

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-visible rounded-2xl bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-neutral-900',
        isActive && 'shadow-md ring-2 ring-[#FF4500]/30',
        isPopular && !isActive && 'ring-1 ring-[#FF4500]/40',
      )}
    >
      <div
        className={cn(
          'relative rounded-t-2xl px-6 pt-5 pb-7 transition-all',
          isActive
            ? 'bg-gradient-to-r from-[#FF4500] via-[#FF5722] to-[#FFA07A]'
            : isPopular
              ? 'bg-[#FF4500]/10 dark:bg-neutral-800'
              : 'bg-[#ECECEC] dark:bg-neutral-800/90',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-lg font-bold tracking-tight',
                isActive
                  ? 'text-white'
                  : isPopular
                    ? 'text-[#FF4500]'
                    : 'text-neutral-900 dark:text-white',
              )}
            >
              {planName}
              {String(plan.id).toLowerCase() === 'starter' && planName !== 'Starter' ? (
                <span className="sr-only">Starter</span>
              ) : null}
            </h3>
            {isPopular && !isActive ? (
              <span className="rounded-full bg-[#FF4500] px-2 py-0.5 text-[10px] font-semibold text-white">
                Popular
              </span>
            ) : null}
          </div>
          {isActive ? (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs">
              Active Plan
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl rounded-b-2xl bg-white px-6 pt-5 pb-8 shadow-xs dark:bg-neutral-900">
        <p className="min-h-[44px] text-xs leading-relaxed text-neutral-600 sm:text-[13px] dark:text-neutral-400">
          {planDesc}
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200/90 bg-[#FCFCFC] p-5 dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-[32px] dark:text-white">
              ₹{priceMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              / month
            </span>
          </div>

          <div className="mt-1">
            <span className="text-xs font-normal text-neutral-400 line-through dark:text-neutral-500">
              ₹{strikePrice.toLocaleString('en-IN')} / month
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
            {features.map((feature, fIdx) => (
              <li key={fIdx} className="flex items-start gap-2.5">
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
  activePlanCode,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plans: PricingPlan[];
  activePlanCode: string;
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
    emblaApi.on('reInit', onSlideSelect);
    return () => {
      emblaApi.off('select', onSlideSelect);
      emblaApi.off('reInit', onSlideSelect);
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
            const planCode = String(plan.id).toLowerCase();
            const isFree =
              (plan.priceMonthly ?? 0) === 0 || planCode === 'starter' || planCode === 'free';
            const isActive =
              planCode === activePlanCode ||
              plan.name.toLowerCase() === activePlanCode ||
              (activePlanCode === 'starter' && isFree);

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
            return (
              <button
                key={String(plan.id)}
                type="button"
                role="tab"
                aria-label={`Go to ${plan.name}`}
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

  const { data: plans, isLoading, isError, error, refetch } = usePricingPlans();
  const { data: accountStatus } = useAccountStatus();
  const subscribe = useSubscribe();
  const selectFreePlan = useSelectFreePlan();

  const isSubmitting = subscribe.isPending || selectFreePlan.isPending;

  const currentPlanCode = (accountStatus?.plan ?? 'starter').toLowerCase();
  const displayPlans = plans && plans.length > 0 ? plans : DEFAULT_FALLBACK_PLANS;

  const proceedToOnboarding = useCallback(() => {
    setHasActivePlan(true);
    setOnboardingPending?.(false);
    void navigate(ROUTES.DASHBOARD);
  }, [navigate, setHasActivePlan, setOnboardingPending]);

  const handleSelect = useCallback(
    (planId: string) => {
      if (isSubmitting) return;

      const targetPlan = displayPlans.find((p) => String(p.id) === planId);
      const isFree = targetPlan
        ? (targetPlan.priceMonthly ?? 0) === 0
        : planId === 'starter' || planId === 'free';

      if (isFree) {
        selectFreePlan.mutate(planId, {
          onSuccess: () => proceedToOnboarding(),
          onError: (err) => {
            toast.error(err.message || 'Could not start your free trial. Please try again.');
          },
        });
        return;
      }

      subscribe.mutate(
        { planId, billingPeriod: 'monthly' },
        {
          onSuccess: () => proceedToOnboarding(),
          onError: (err) => {
            if (err.message === 'Checkout was dismissed.') return;
            toast.error(err.message || 'Payment could not be completed. Please try again.');
          },
        },
      );
    },
    [displayPlans, proceedToOnboarding, selectFreePlan, subscribe, isSubmitting],
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
          <div
            className={cn(
              'mt-12 hidden gap-6 text-left sm:grid',
              displayPlans.length <= 2
                ? 'mx-auto max-w-2xl sm:grid-cols-2'
                : displayPlans.length === 3
                  ? 'sm:grid-cols-2 md:grid-cols-3'
                  : 'sm:grid-cols-2 lg:grid-cols-4',
              'lg:gap-8',
            )}
          >
            {displayPlans.map((plan) => {
              const planCode = String(plan.id).toLowerCase();
              const isFree =
                (plan.priceMonthly ?? 0) === 0 || planCode === 'starter' || planCode === 'free';
              const isActive =
                planCode === currentPlanCode ||
                plan.name.toLowerCase() === currentPlanCode ||
                (currentPlanCode === 'starter' && isFree);

              return (
                <PlanCard
                  key={String(plan.id)}
                  plan={plan}
                  isActive={isActive}
                  onSelect={handleSelect}
                  isSubmitting={isSubmitting}
                  submittingId={submittingPlanId(subscribe, selectFreePlan)}
                />
              );
            })}
          </div>

          <div className="mt-10 sm:hidden">
            <MobileCarousel
              plans={displayPlans}
              activePlanCode={currentPlanCode}
              onSelect={handleSelect}
              isSubmitting={isSubmitting}
              submittingId={submittingPlanId(subscribe, selectFreePlan)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function submittingPlanId(
  subscribe: ReturnType<typeof useSubscribe>,
  selectFreePlan: ReturnType<typeof useSelectFreePlan>,
): string | null {
  if (subscribe.isPending) return subscribe.variables?.planId ?? null;
  if (selectFreePlan.isPending) return selectFreePlan.variables ?? null;
  return null;
}
