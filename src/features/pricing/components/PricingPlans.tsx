import { useState } from 'react';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';

import { PricingPlanCard } from './PricingPlanCard';

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans, isLoading, error } = usePricingPlans();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-center">
      <h1 className="text-foreground text-3xl font-semibold">Pricing plans</h1>
      <p className="text-muted-foreground mt-2">Choose the plan that fits your business needs.</p>

      <Tabs
        value={billingPeriod}
        onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
        className="mx-auto mt-8 w-fit"
      >
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Annually</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-10">
        {isLoading ? <Loader label="Loading plans" /> : null}
        {error ? <ApiErrorMessage error={error} className="mx-auto max-w-sm" /> : null}

        {plans?.length ? (
          <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                billingPeriod={billingPeriod}
                highlighted={index === 1}
                onSelect={(planId) => {
                  // Subscription checkout flow is a future integration point.
                  void planId;
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
