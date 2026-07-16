import useEmblaCarousel from 'embla-carousel-react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';

// ─── Static plan data (matches the screenshot exactly) ───────────────────────

interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'Perfect for individuals exploring startup ideas.',
    priceMonthly: 799,
    priceYearly: 7990,
    highlighted: false,
    features: [
      'AI Co-Founder (Basic)',
      '20 AI conversations / month',
      'Founder Foundation',
      '5 AI-generated documents',
      'Basic Founder Intelligence',
      'Community Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Perfect for individuals exploring startup ideas.',
    priceMonthly: 999,
    priceYearly: 9990,
    highlighted: true,
    features: [
      'AI Co-Founder (Basic)',
      '10 AI conversations / month',
      'Founder Foundation',
      '5 AI-generated documents',
      'Basic Founder Intelligence',
      'Community Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Perfect for individuals exploring startup ideas.',
    priceMonthly: 1499,
    priceYearly: 14990,
    highlighted: false,
    features: [
      'AI Co-Founder (Basic)',
      '20 AI conversations / month',
      'Founder Foundation',
      '5 AI-generated documents',
      'Basic Founder Intelligence',
      'Community Support',
    ],
  },
];

// ─── Individual plan card ─────────────────────────────────────────────────────

function PlanCard({
  plan,
  billingPeriod,
  onSelect,
}: {
  plan: Plan;
  billingPeriod: 'monthly' | 'yearly';
  onSelect: (id: string) => void;
}) {
  const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;

  return (
    <div
      className={cn(
        'bg-card flex h-full flex-col rounded-2xl border p-6 text-left transition-shadow',
        plan.highlighted
          ? 'border-primary shadow-primary/10 shadow-lg'
          : 'border-border hover:shadow-md',
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3
          className={cn(
            'text-lg font-semibold',
            plan.highlighted ? 'text-primary' : 'text-foreground',
          )}
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
        <p className="text-muted-foreground mt-1 text-sm">{plan.tagline}</p>
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
                  plan.highlighted ? 'text-primary' : 'text-muted-foreground',
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
        variant={plan.highlighted ? 'default' : 'outline'}
        onClick={() => onSelect(plan.id)}
      >
        Choose plan
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
}: {
  plans: Plan[];
  billingPeriod: 'monthly' | 'yearly';
  onSelect: (id: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(1); // start on Professional (highlighted)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: 1,
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
            <div key={plan.id} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-in-out',
                  idx === activeIdx ? 'scale-100 opacity-100' : 'scale-95 opacity-60',
                )}
              >
                <PlanCard plan={plan} billingPeriod={billingPeriod} onSelect={onSelect} />
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
              key={plan.id}
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
  value: 'monthly' | 'yearly';
  onChange: (v: 'monthly' | 'yearly') => void;
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const setHasActivePlan = useAuthStore((state) => state.setHasActivePlan);

  const handleSelect = (_planId: string) => {
    // Mark the user as having an active plan and navigate to the dashboard.
    // TODO: wire up checkout / subscription API when available.
    setHasActivePlan(true);
    void navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-foreground text-3xl font-semibold">Pricing Plans</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Choose the Plan that fits your business needs
      </p>

      <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />

      {/* Desktop: 3-column grid */}
      <div className="mt-10 hidden gap-6 text-left sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Mobile: full-bleed horizontal carousel */}
      <div className="mt-10 sm:hidden">
        <MobileCarousel plans={PLANS} billingPeriod={billingPeriod} onSelect={handleSelect} />
      </div>
    </div>
  );
}
