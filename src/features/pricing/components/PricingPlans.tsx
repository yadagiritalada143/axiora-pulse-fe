import useEmblaCarousel from 'embla-carousel-react';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { PricingPlan } from '@/types/api.types';
import type { BillingPeriod } from '@/types/billing.types';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';

function PlanCard({
  plan,
  billingPeriod,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plan: PricingPlan;
  billingPeriod: BillingPeriod;
  onSelect: (id: string) => void;
  isSubmitting: boolean;
  submittingId: string | null;
}) {
  const planId = String(plan.id);
  const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  const isThisSubmitting = submittingId === planId;

  return (
    <div
      className={cn(
        'bg-card flex h-full flex-col rounded-2xl border p-6 text-left transition-shadow',
        plan.popular
          ? 'border-primary shadow-primary/10 shadow-lg'
          : 'border-border hover:shadow-md',
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3
          className={cn('text-lg font-semibold', plan.popular ? 'text-primary' : 'text-foreground')}
        >
          {plan.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-foreground text-2xl font-bold">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-muted-foreground text-sm">
            / {billingPeriod === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        {plan.description ? (
          <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
        ) : null}
      </div>

      {/* Features */}
      <div className="mb-6 flex-1">
        <p className="text-foreground mb-2 text-sm font-medium">Features:</p>
        <ul className="space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  plan.popular ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Button
        className="w-full"
        variant={plan.popular ? 'default' : 'outline'}
        onClick={() => onSelect(planId)}
        disabled={isSubmitting}
      >
        {isThisSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing…
          </>
        ) : (
          'Choose plan'
        )}
      </Button>
    </div>
  );
}

// ─── Mobile carousel (Embla) ─────────────────────────────────────────────────
//
// Full-bleed: this breaks out of the page's max-w-5xl / px-4 wrapper so the
// slide width and peek amount are computed from the actual device viewport
// (100vw) rather than the padded content column. That's what kept the peek
// and centering from lining up correctly on real phones.

function MobileCarousel({
  plans,
  billingPeriod,
  onSelect,
  isSubmitting,
  submittingId,
}: {
  plans: PricingPlan[];
  billingPeriod: BillingPeriod;
  onSelect: (id: string) => void;
  isSubmitting: boolean;
  submittingId: string | null;
}) {
  // Start on the highlighted plan if there is one, otherwise the first.
  const initialIdx = Math.max(
    0,
    plans.findIndex((p) => p.popular),
  );
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
    // Full-bleed wrapper: escapes the parent's max-w-5xl/px-4 so widths below
    // are true percentages of the device screen, not the padded container.
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      {/* Side padding here (not on the slides) is what creates the peek,
          sized in vw so it scales with the actual device width. */}
      <div ref={emblaRef} className="overflow-hidden px-[10vw]">
        <div className="-ml-4 flex items-stretch">
          {plans.map((plan, idx) => (
            <div key={String(plan.id)} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-in-out',
                  idx === activeIdx ? 'scale-100 opacity-100' : 'scale-95 opacity-60',
                )}
              >
                <PlanCard
                  plan={plan}
                  billingPeriod={billingPeriod}
                  onSelect={onSelect}
                  isSubmitting={isSubmitting}
                  submittingId={submittingId}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controls: Prev · Dots · Next */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous plan"
          onClick={scrollPrev}
          disabled={activeIdx === 0}
          className="border-border bg-card text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Pricing plan slides">
          {plans.map((plan, idx) => (
            <button
              key={String(plan.id)}
              type="button"
              role="tab"
              aria-label={`Go to ${plan.name}`}
              aria-selected={idx === activeIdx}
              onClick={() => scrollTo(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                idx === activeIdx ? 'bg-primary w-6' : 'bg-border hover:bg-muted-foreground w-2',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next plan"
          onClick={scrollNext}
          disabled={activeIdx === plans.length - 1}
          className="border-border bg-card text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Billing period toggle ────────────────────────────────────────────────────

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (v: BillingPeriod) => void;
}) {
  return (
    <div className="border-border bg-muted mx-auto mt-6 inline-flex items-center gap-1 rounded-full border p-1">
      {(['monthly', 'yearly'] as const).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            'rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors',
            value === period
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {period === 'monthly' ? 'Monthly' : 'Annually'}
        </button>
      ))}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const navigate = useNavigate();
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);
  const setOnboardingPending = useAuthStore((state) => state.setOnboardingPending);

  const { data: plans, isLoading, isError, error, refetch } = usePricingPlans();
  const subscribe = useSubscribe();

  /**
   * Advance into dashboard once a plan is secured. Called after a successful
   * Razorpay authorization (or immediately for a free plan). Razorpay's webhook
   * remains the authoritative source for entitlement.
   */
  const proceedToOnboarding = useCallback(() => {
    setHasActivePlan(true);
    setOnboardingPending?.(false);
    void navigate(ROUTES.DASHBOARD);
  }, [navigate, setHasActivePlan, setOnboardingPending]);

  const handleSelect = useCallback(
    (planId: string) => {
      if (subscribe.isPending) return;

      const selected = (plans ?? []).find((p) => String(p.id) === planId);
      const price = selected
        ? billingPeriod === 'monthly'
          ? selected.priceMonthly
          : selected.priceYearly
        : 0;

      // A free (₹0) plan needs no payment — proceed straight into onboarding.
      if (price <= 0) {
        proceedToOnboarding();
        return;
      }

      subscribe.mutate(
        { planId, billingPeriod },
        {
          onSuccess: () => proceedToOnboarding(),
          onError: (err) => {
            // A dismissed Checkout modal isn't a real failure — stay on the page quietly.
            if (err.message === 'Checkout was dismissed.') return;
            toast.error(err.message || 'Could not start the subscription. Please try again.');
          },
        },
      );
    },
    [billingPeriod, plans, proceedToOnboarding, subscribe],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-foreground text-3xl font-semibold">Pricing Plans</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Choose the Plan that fits your business needs
      </p>

      <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />

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
          {/* Desktop: 3-column grid */}
          <div className="mt-10 hidden gap-6 text-left sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {(plans ?? []).map((plan) => (
              <PlanCard
                key={String(plan.id)}
                plan={plan}
                billingPeriod={billingPeriod}
                onSelect={handleSelect}
                isSubmitting={subscribe.isPending}
                submittingId={subscribe.isPending ? (subscribe.variables?.planId ?? null) : null}
              />
            ))}
          </div>

          {/* Mobile: full-bleed horizontal carousel */}
          <div className="mt-10 sm:hidden">
            <MobileCarousel
              plans={plans ?? []}
              billingPeriod={billingPeriod}
              onSelect={handleSelect}
              isSubmitting={subscribe.isPending}
              submittingId={subscribe.isPending ? (subscribe.variables?.planId ?? null) : null}
            />
          </div>
        </>
      )}
    </div>
  );
}
